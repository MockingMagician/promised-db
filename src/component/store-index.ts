import {
    IndexInterface,
    KeyCursorInterface,
    ObjectStoreInterface,
    ValueCursorInterface,
} from '@/component/interface/components.interface'
import { ValueCursor } from '@/component/value-cursor'
import { KeyCursor } from '@/component/key-cursor'
import { requestResolver } from '@/shared/request-resolver'

export class StoreIndex implements IndexInterface {
    constructor(
        private readonly ctx: {
            index: IDBIndex
            objectStore: ObjectStoreInterface
        }
    ) {}

    get keyPath(): string | string[] {
        return this.ctx.index.keyPath
    }

    get multiEntry(): boolean {
        return this.ctx.index.multiEntry
    }

    get name(): string {
        return this.ctx.index.name
    }

    get unique(): boolean {
        return this.ctx.index.unique
    }

    get objectStore(): ObjectStoreInterface {
        return this.ctx.objectStore
    }

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

    getAllKeys<KeyValType, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<KeyValType[]> {
        const request = this.ctx.index.getAllKeys(query, count)
        return requestResolver<KeyValType[]>(request as IDBRequest<KeyValType[]>)
    }

    getKey<KeyValType, K extends IDBValidKey>(key: IDBKeyRange | K): Promise<KeyValType> {
        const request = this.ctx.index.getKey(key)
        return requestResolver<KeyValType>(request as IDBRequest<KeyValType>)
    }

    openCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): ValueCursorInterface<PK, K, R> {
        const request = this.ctx.index.openCursor(query, direction)
        return new ValueCursor<PK, K, R>({
            request,
            direction,
            source: new StoreIndex({
                index: this.ctx.index,
                objectStore: this.ctx.objectStore,
            }),
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
            source: new StoreIndex({
                index: this.ctx.index,
                objectStore: this.ctx.objectStore,
            }),
        })
    }
}
