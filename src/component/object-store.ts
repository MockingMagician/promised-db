import {
    IndexInterface,
    KeyCursorInterface,
    ObjectStoreInterface,
    ValueCursorInterface,
} from '@/component/interface/components.interface'
import { Index } from '@/component/index'
import { ValueCursor } from '@/component/value-cursor'
import { KeyCursor } from '@/component/key-cursor'

export class ObjectStore implements ObjectStoreInterface {
    constructor(private readonly ctx: { objectStore: IDBObjectStore }) {}

    private resolveIDBRequest<V>(request: IDBRequest): Promise<V> {
        return new Promise((resolve, reject) => {
            request.addEventListener('success', (event) => {
                const target = event.target as IDBRequest
                resolve(target.result)
            })
            request.addEventListener('error', (event) => {
                const target = event.target as IDBRequest
                reject(target.error)
            })
        })
    }

    add<V, K extends IDBValidKey>(value: V, key?: K): Promise<void> {
        const request = this.ctx.objectStore.add(value, key)
        return this.resolveIDBRequest(request)
    }

    clear(): Promise<void> {
        const request = this.ctx.objectStore.clear()
        return this.resolveIDBRequest(request)
    }

    count<K extends IDBValidKey>(query?: IDBKeyRange | K): Promise<number> {
        const request = this.ctx.objectStore.count(query)
        return this.resolveIDBRequest(request)
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
        return new Index({ index })
    }

    delete<K extends IDBValidKey>(query: IDBKeyRange | K): Promise<void> {
        const request = this.ctx.objectStore.delete(query)
        return this.resolveIDBRequest(request)
    }

    deleteIndex(name: string): void {
        return this.ctx.objectStore.deleteIndex(name)
    }

    get<R, K extends IDBValidKey>(key: K): Promise<R> {
        const request = this.ctx.objectStore.get(key)
        return this.resolveIDBRequest<R>(request)
    }

    getAll<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<R[]> {
        const request = this.ctx.objectStore.getAll(query, count)
        return this.resolveIDBRequest<R[]>(request)
    }

    getAllKeys<K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<K[]> {
        const request = this.ctx.objectStore.getAll(query, count)
        return this.resolveIDBRequest<K[]>(request)
    }

    getKey<K extends IDBValidKey>(key: IDBKeyRange | K): Promise<K> {
        const request = this.ctx.objectStore.getKey(key)
        return this.resolveIDBRequest<K>(request)
    }

    index(name: string): IndexInterface {
        const index = this.ctx.objectStore.index(name)
        return new Index({ index })
    }

    async openCursor<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): Promise<ValueCursorInterface<R>> {
        const request = this.ctx.objectStore.openCursor(query, direction)
        return new ValueCursor<R>({ request })
    }

    async openKeyCursor<K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): Promise<KeyCursorInterface<K>> {
        const request = this.ctx.objectStore.openKeyCursor(query, direction)
        return new KeyCursor<K>({ request })
    }

    put<V, K extends IDBValidKey>(value: V, key?: K): Promise<void> {
        const request = this.ctx.objectStore.put(value, key)
        return this.resolveIDBRequest(request)
    }
}
