import { KeyCursorInterface } from '@/component/interface/components.interface'

export class KeyCursor<PK extends IDBValidKey, K extends IDBValidKey>
    implements KeyCursorInterface<PK, K>
{
    private _key?: K
    private _primaryKey?: PK

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
            /* istanbul ignore next */
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
            this._primaryKey = cursor.primaryKey as PK
            cursor.continue()
            return true
        }
        this._key = undefined
        this._primaryKey = undefined
        return false
    }

    key(): K | undefined {
        return this._key
    }

    primaryKey(): PK | undefined {
        return this._primaryKey
    }
}
