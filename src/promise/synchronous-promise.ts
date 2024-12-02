/**
 * strongly inspired by the original SynchronousPromise package
 * https://github.com/fluffynuts/synchronous-promise
 * WHY ? Read the following article:
 * https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a
 */

type PromiseStatus = 'pending' | 'resolved' | 'rejected'

type Continuation<T> = {
    promise: SynchronousPromise<T>
    nextFn?: (value: T) => any
    catchFn?: (error: any) => any
}

function looksLikeAPromise(obj: any): obj is Promise<any> {
    return obj && typeof obj.then === 'function'
}

function passThrough<T>(value: T): T {
    return value
}

class SynchronousPromise<T> {
    private status: PromiseStatus = 'pending'
    private _data?: T
    private _error?: any
    private _continuations: Continuation<T>[] = []
    private _parent: SynchronousPromise<any> | null = null
    private _paused: boolean = false

    get [Symbol.toStringTag](): string {
        return 'Promise'
    }

    constructor(
        handler?: (
            resolve: (value: T) => void,
            reject: (reason?: any) => void
        ) => void
    ) {
        if (handler) {
            handler(this._continueWith.bind(this), this._failWith.bind(this))
        }
    }

    static unresolved<T>(): SynchronousPromise<T> {
        return new SynchronousPromise<T>()
    }

    static resolve<T>(result: T | Promise<T>): SynchronousPromise<T> {
        return new SynchronousPromise<T>((resolve, reject) => {
            if (looksLikeAPromise(result)) {
                result.then(resolve).catch(reject)
            } else {
                resolve(result)
            }
        })
    }

    static reject<T>(reason: any): SynchronousPromise<T> {
        return new SynchronousPromise<T>((_, reject) => reject(reason))
    }

    static all<T>(promises: Array<T | Promise<T>>): SynchronousPromise<T[]> {
        return new SynchronousPromise<T[]>((resolve, reject) => {
            const results: T[] = []
            let resolvedCount = 0

            promises.forEach((promise, index) => {
                SynchronousPromise.resolve(promise)
                    .then((result) => {
                        results[index] = result
                        resolvedCount++
                        if (resolvedCount === promises.length) {
                            resolve(results)
                        }
                    })
                    .catch(reject)
            })
        })
    }

    static any<T>(promises: Array<T | Promise<T>>): SynchronousPromise<T> {
        return new SynchronousPromise<T>((resolve, reject) => {
            const errors: any[] = []
            let rejectedCount = 0

            promises.forEach((promise, index) => {
                SynchronousPromise.resolve(promise)
                    .then(resolve)
                    .catch((error) => {
                        errors[index] = error
                        rejectedCount++
                        if (rejectedCount === promises.length) {
                            reject(errors)
                        }
                    })
            })
        })
    }

    then<U>(
        nextFn?: (value: T) => U | Promise<U>,
        catchFn?: (error: any) => U | Promise<U>
    ): SynchronousPromise<U> {
        const next = SynchronousPromise.unresolved<U>()._setParent(this)

        if (this._isRejected()) {
            if (catchFn) {
                try {
                    const catchResult = catchFn(this._error)
                    return SynchronousPromise.resolve<U>(
                        catchResult
                    )._setParent(this)
                } catch (e) {
                    return SynchronousPromise.reject<U>(e)._setParent(this)
                }
            }
            return SynchronousPromise.reject<U>(this._error)._setParent(this)
        }

        this._continuations.push({
            promise: next as unknown as SynchronousPromise<T>,
            nextFn,
            catchFn,
        })

        this._runResolutions()
        return next
    }

    catch<U>(handler: (error: any) => U | Promise<U>): SynchronousPromise<U> {
        return this.then(undefined, handler)
    }

    finally<U>(
        callback?: (value: T | null) => U | Promise<U>
    ): SynchronousPromise<T> {
        const runFinally = (result: T | null, err?: any): T | Promise<T> => {
            if (!callback) {
                callback = passThrough as any
            }

            const callbackResult = callback(result)
            if (looksLikeAPromise(callbackResult)) {
                return callbackResult.then(() => {
                    if (err) throw err
                    return result!
                })
            } else {
                return result!
            }
        }

        return this.then((result) => runFinally(result)).catch((err) =>
            runFinally(null, err)
        )
    }

    private _continueWith(data: T) {
        const firstPending = this._findFirstPending()
        if (firstPending) {
            firstPending._data = data
            firstPending._setResolved()
        }
    }

    private _failWith(error: any) {
        const firstPending = this._findFirstPending()
        if (firstPending) {
            firstPending._error = error
            firstPending._setRejected()
        }
    }

    private _findFirstPending(): SynchronousPromise<T> | null {
        let current: SynchronousPromise<T> | null = this
        while (current && current.status !== 'pending') {
            current = current._parent
        }
        return current
    }

    private _setResolved() {
        this.status = 'resolved'
        this._runResolutions()
    }

    private _setRejected() {
        this.status = 'rejected'
        this._runRejections()
    }

    private _isRejected(): boolean {
        return this.status === 'rejected'
    }

    private _runResolutions() {
        if (this.status !== 'resolved') return

        const continuations = this._continuations.splice(0)
        continuations.forEach(({ nextFn, promise }) => {
            if (nextFn) {
                try {
                    const result = nextFn(this._data!)
                    promise.resolve(result)
                } catch (e) {
                    promise.reject(e)
                }
            }
        })
    }

    private _runRejections() {
        if (this.status !== 'rejected') return

        const continuations = this._continuations.splice(0)
        continuations.forEach(({ catchFn, promise }) => {
            if (catchFn) {
                try {
                    const result = catchFn(this._error)
                    promise.resolve(result)
                } catch (e) {
                    promise.reject(e)
                }
            } else {
                promise.reject(this._error)
            }
        })
    }

    private _setParent(parent: SynchronousPromise<any>): this {
        if (this._parent) throw new Error('Parent already set')
        this._parent = parent
        return this
    }

    resolve(value: T): void {
        this._continueWith(value)
    }

    reject(reason: any): void {
        this._failWith(reason)
    }
}

export { SynchronousPromise }
