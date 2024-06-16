import { ValueCursorInterface } from '@/component/interface/components.interface'

export class ValueCursor<R> implements ValueCursorInterface<R> {
    private _value?: R

    constructor(
        private readonly ctx: { request: IDBRequest<IDBCursorWithValue | null> }
    ) {}

    private resolveIDBRequestCursorWithValue(
        request: IDBRequest<IDBCursorWithValue | null>
    ): Promise<IDBCursorWithValue | null> {
        return new Promise((resolve, reject): void => {
            request.onsuccess = (event) => {
                const target = event.target as IDBRequest<IDBCursorWithValue>
                const cursor = target.result
                request.onsuccess = null
                request.onerror = null
                resolve(cursor)
            }
            request.onerror = (event) => {
                const target = event.target as IDBRequest<IDBCursorWithValue>
                request.onsuccess = null
                request.onerror = null
                reject(target.error)
            }
        })
    }

    async next(): Promise<boolean> {
        const cursor = await this.resolveIDBRequestCursorWithValue(
            this.ctx.request
        )
        if (cursor) {
            this._value = cursor.value
            cursor.continue()
            return true
        }
        this._value = undefined
        return false
    }

    value(): R | undefined {
        return this._value
    }
}
