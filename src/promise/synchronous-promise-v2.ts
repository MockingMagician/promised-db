/**
 * strongly inspired by the original SynchronousPromise package
 * https://github.com/fluffynuts/synchronous-promise
 * WHY ? Read the following article:
 * https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a
 */

type PromiseStatus = 'pending' | 'resolved' | 'rejected'

class SynchronousPromiseV2<T> implements Promise<T> {
    readonly [Symbol.toStringTag]: string

    catch<TResult = never>(onrejected?: ((reason: any) => (PromiseLike<TResult> | TResult)) | undefined | null): SynchronousPromiseV2<T | TResult> {
        return Promise.resolve(undefined)
    }

    finally(onfinally?: (() => void) | undefined | null): SynchronousPromiseV2<T> {
        return Promise.resolve(undefined)
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => (PromiseLike<TResult1> | TResult1)) | undefined | null,
        onrejected?: ((reason: any) => (PromiseLike<TResult2> | TResult2)) | undefined | null
    ): SynchronousPromiseV2<TResult1 | TResult2> {
        return Promise.resolve(undefined)
    }
}

export { SynchronousPromiseV2 }
