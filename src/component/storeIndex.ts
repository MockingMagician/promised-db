import {
    IndexInterface,
    KeyCursorInterface,
    ValueCursorInterface,
} from '@/component/interface/components.interface'
import { ValueCursor } from '@/component/value-cursor'
import { KeyCursor } from '@/component/key-cursor'

export class StoreIndex implements IndexInterface {
    constructor(private readonly ctx: { index: IDBIndex }) {}

    private resolveIDBRequest<V>(request: IDBRequest): Promise<V> {
        return new Promise((resolve, reject) => {
            request.addEventListener('success', (event) => {
                const target = event.target as IDBRequest
                resolve(target.result)
            })
            /* istanbul ignore next */
            request.addEventListener('error', (event) => {
                const target = event.target as IDBRequest
                reject(target.error)
            })
        })
    }

    count<K extends IDBValidKey>(query?: IDBKeyRange | K): Promise<number> {
        const request = this.ctx.index.count(query)
        return this.resolveIDBRequest(request)
    }

    get<R, K extends IDBValidKey>(key: K): Promise<R> {
        const request = this.ctx.index.get(key)
        return this.resolveIDBRequest<R>(request)
    }

    getAll<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<R[]> {
        const request = this.ctx.index.getAll(query, count)
        return this.resolveIDBRequest<R[]>(request)
    }

    getAllKeys<K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<K[]> {
        const request = this.ctx.index.getAllKeys(query, count)
        return this.resolveIDBRequest<K[]>(request)
    }

    getKey<K extends IDBValidKey>(key: IDBKeyRange | K): Promise<K> {
        const request = this.ctx.index.getKey(key)
        return this.resolveIDBRequest<K>(request)
    }

    openCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): ValueCursorInterface<PK, K, R> {
        const request = this.ctx.index.openCursor(query, direction)
        return new ValueCursor<PK, K, R>({ request, direction, source: new StoreIndex( {index: this.ctx.index} ) })
    }

    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K, R> {
        const request = this.ctx.index.openKeyCursor(query, direction)
        return new KeyCursor<PK, K, R>({ request, direction, source: new StoreIndex( {index: this.ctx.index} )  })
    }
}
