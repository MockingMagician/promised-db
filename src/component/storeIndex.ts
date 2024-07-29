import {
    IndexInterface,
    KeyCursorInterface,
    ValueCursorInterface,
} from '@/component/interface/components.interface'
import { ValueCursor } from '@/component/value-cursor'
import { KeyCursor } from '@/component/key-cursor'
import { requestResolver } from '@/shared/request-resolver'

export class StoreIndex implements IndexInterface {
    constructor(private readonly ctx: { index: IDBIndex }) {}

    count<K extends IDBValidKey>(query?: IDBKeyRange | K): Promise<number> {
        const request = this.ctx.index.count(query)
        return requestResolver(request)
    }

    get<R, K extends IDBValidKey>(key: K): Promise<R> {
        const request = this.ctx.index.get(key)
        return requestResolver(request)
    }

    getAll<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<R[]> {
        const request = this.ctx.index.getAll(query, count)
        return requestResolver<R[]>(request)
    }

    getAllKeys<K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<K[]> {
        const request = this.ctx.index.getAllKeys(query, count)
        return requestResolver<K[]>(request as IDBRequest<K[]>)
    }

    getKey<K extends IDBValidKey>(key: IDBKeyRange | K): Promise<K> {
        const request = this.ctx.index.getKey(key)
        return requestResolver<K>(request as IDBRequest<K>)
    }

    openCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): ValueCursorInterface<PK, K, R> {
        const request = this.ctx.index.openCursor(query, direction)
        return new ValueCursor<PK, K, R>({
            request,
            direction,
            source: new StoreIndex({ index: this.ctx.index }),
        })
    }

    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K> {
        const request = this.ctx.index.openKeyCursor(query, direction)
        return new KeyCursor<PK, K>({
            request,
            direction,
            source: new StoreIndex({ index: this.ctx.index }),
        })
    }
}
