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
    objectStoreNames: string[]
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
    openCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): ValueCursorInterface<PK, K, R>
    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K, R>
    put<V, K extends IDBValidKey>(value: V, key?: K): Promise<void>
    indexNames: string[]
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
    openCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): ValueCursorInterface<PK, K, R>
    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey, R>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K, R>
}

export interface ValueCursorInterface<
    PK extends IDBValidKey,
    K extends IDBValidKey,
    R,
> extends KeyCursorInterface<PK, K, R> {
    value: R | undefined
}

export interface KeyCursorInterface<
    PK extends IDBValidKey,
    K extends IDBValidKey,
    R,
> {
    primaryKey: PK | undefined
    key: K | undefined
    direction: IDBCursorDirection
    source: ObjectStoreInterface | IndexInterface
    end(): Promise<boolean>
    continue(key?: K): void
    advance(count: number): void
    continuePrimaryKey(key: K, primaryKey: PK): void
    delete(): Promise<void>
    update(value: R): Promise<void>
}

export interface TransactionInterface {
    abort(): Promise<void>
    commit(): Promise<void>
    objectStore(name: string): ObjectStoreInterface
    objectStoreNames: string[]
    db: DatabaseInterface
    durability: IDBTransactionDurability
    error: DOMException
    mode: IDBTransactionMode
}
