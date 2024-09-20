import {
    IndexInterface,
    KeyCursorInterface,
    ObjectStoreInterface,
    ValueCursorInterface,
} from '@/component/interface/components.interface'
import { StoreIndex } from '@/component/store-index'
import { ValueCursor } from '@/component/value-cursor'
import { KeyCursor } from '@/component/key-cursor'
import { requestResolver } from '@/shared/request-resolver'

export class ObjectStore implements ObjectStoreInterface {
    constructor(private readonly ctx: { objectStore: IDBObjectStore }) {}

    add<V, K extends IDBValidKey>(value: V, key?: K): Promise<K> {
        const request = this.ctx.objectStore.add(value, key) as IDBRequest<K>
        return requestResolver<K>(request)
    }

    clear(): Promise<void> {
        const request = this.ctx.objectStore.clear()
        return requestResolver<undefined>(request)
    }

    count<K extends IDBValidKey>(query?: IDBKeyRange | K): Promise<number> {
        const request = this.ctx.objectStore.count(query)
        return requestResolver<number>(request)
    }

    createIndex(
        indexName: string,
        keyPath: string | string[],
        options?: IDBIndexParameters
    ): IndexInterface {
        const index = this.ctx.objectStore.createIndex(
            indexName,
            keyPath,
            options
        )
        return new StoreIndex({ index, objectStore: this })
    }

    delete<K extends IDBValidKey>(query: IDBKeyRange | K): Promise<void> {
        const request = this.ctx.objectStore.delete(query)
        return requestResolver<undefined>(request)
    }

    deleteIndex(name: string): void {
        return this.ctx.objectStore.deleteIndex(name)
    }

    get<R, K extends IDBValidKey>(key: K): Promise<R> {
        const request = this.ctx.objectStore.get(key)
        return requestResolver<R>(request)
    }

    getAll<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<R[]> {
        const request = this.ctx.objectStore.getAll(query, count)
        return requestResolver<R[]>(request)
    }

    getAllKeys<K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<K[]> {
        const request = this.ctx.objectStore.getAllKeys(
            query,
            count
        ) as IDBRequest<K[]>
        return requestResolver<K[]>(request)
    }

    getKey<K extends IDBValidKey>(key: IDBKeyRange | K): Promise<K> {
        const request = this.ctx.objectStore.getKey(key) as IDBRequest<K>
        return requestResolver<K>(request)
    }

    index(name: string): IndexInterface {
        const index = this.ctx.objectStore.index(name)
        return new StoreIndex({ index, objectStore: this })
    }

    openCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): ValueCursorInterface<PK, K, R> {
        const request = this.ctx.objectStore.openCursor(query, direction)
        return new ValueCursor<PK, K, R>({
            request,
            direction,
            source: new ObjectStore({ objectStore: this.ctx.objectStore }),
        })
    }

    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K> {
        const request = this.ctx.objectStore.openKeyCursor(query, direction)
        return new KeyCursor<PK, K>({
            request,
            direction,
            source: new ObjectStore({ objectStore: this.ctx.objectStore }),
        })
    }

    put<V, K extends IDBValidKey>(value: V, key?: K): Promise<void> {
        const request = this.ctx.objectStore.put(value, key)
        return requestResolver<IDBValidKey>(request).then(() => void 0)
    }

    get indexNames(): string[] {
        return Array.from(this.ctx.objectStore.indexNames)
    }
}
