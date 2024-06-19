export interface DatabaseInterface {
    close(): void
    createObjectStore(
        name: string,
        options?: IDBObjectStoreParameters
    ): ObjectStoreInterface
    deleteObjectStore(name: string): void
    transaction(
        storeNames: string | string[],
        mode?: IDBTransactionMode,
        options?: IDBTransactionOptions
    ): TransactionInterface
}

export interface ObjectStoreInterface {
    add<V, K extends IDBValidKey>(value: V, key?: K): Promise<void>
    clear(): Promise<void>
    count<K extends IDBValidKey>(query?: IDBKeyRange | K): Promise<number>
    createIndex(
        indexName: string,
        keyPath: string | string[],
        options?: IDBIndexParameters
    ): IndexInterface
    delete<K extends IDBValidKey>(query: IDBKeyRange | K): Promise<void>
    deleteIndex(name: string): void
    get<R, K extends IDBValidKey>(key: K): Promise<R>
    getAll<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<R[]>
    getAllKeys<K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<K[]>
    getKey<K extends IDBValidKey>(key: IDBKeyRange | K): Promise<K>
    index(name: string): IndexInterface
    openCursor<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): ValueCursorInterface<R>
    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K>
    put<V, K extends IDBValidKey>(value: V, key?: K): Promise<void>
}

export interface IndexInterface {
    count<K extends IDBValidKey>(query?: IDBKeyRange | K): Promise<number>
    get<R, K extends IDBValidKey>(key: K): Promise<R>
    getAll<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<R[]>
    getAllKeys<K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        count?: number
    ): Promise<K[]>
    getKey<K extends IDBValidKey>(key: IDBKeyRange | K): Promise<K>
    openCursor<R, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): ValueCursorInterface<R>
    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K>
}

export interface ValueCursorInterface<R> {
    value(): R | undefined
    next(): Promise<boolean>
}

export interface KeyCursorInterface<
    PK extends IDBValidKey,
    K extends IDBValidKey,
> {
    primaryKey(): PK | undefined
    key(): K | undefined
    next(): Promise<boolean>
}

export interface TransactionInterface {
    abort(): Promise<void>
    commit(): Promise<void>
    objectStore(name: string): ObjectStoreInterface
}
