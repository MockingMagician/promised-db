import { KeyCursorInterface } from '@/component/interface/components.interface'

export class KeyCursor<K extends IDBValidKey> implements KeyCursorInterface<K> {
    private _key?: K

    constructor(
        private readonly ctx: { request: IDBRequest<IDBCursor | null> }
    ) {}

    private resolveIDBRequestCursor(
        request: IDBRequest<IDBCursor | null>
    ): Promise<IDBCursor | null> {
        return new Promise((resolve, reject): void => {
            request.onsuccess = (event) => {
                const target = event.target as IDBRequest<IDBCursor>
                const cursor = target.result
                request.onsuccess = null
                request.onerror = null
                resolve(cursor)
            }
            request.onerror = (event) => {
                const target = event.target as IDBRequest<IDBCursor>
                request.onsuccess = null
                request.onerror = null
                reject(target.error)
            }
        })
    }

    async next(): Promise<boolean> {
        const cursor = await this.resolveIDBRequestCursor(this.ctx.request)
        if (cursor) {
            this._key = cursor.key as K
            cursor.continue()
            return true
        }
        this._key = undefined
        return false
    }

    key(): K | undefined {
        return this._key
    }
}
