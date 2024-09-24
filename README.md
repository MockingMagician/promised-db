**Overview**
----------

**@idxdb/promised** is a lightweight library that wraps the IndexedDB API, providing a more natural way to work with promises. It allows you to easily store and retrieve data in an indexed database using async/await syntax, making it easier to integrate with your existing codebase.

[![codecov](https://codecov.io/gh/MockingMagician/promised-db/branch/main/graph/badge.svg)](https://codecov.io/gh/MockingMagician/promised-db)
[![test](https://github.com/MockingMagician/promised-db/actions/workflows/test-and-deploy.yaml/badge.svg)](https://github.com/MockingMagician/promised-db/actions/workflows/test-and-deploy.yaml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
![NPM Version](https://img.shields.io/npm/v/%40idxdb%2Fpromised)
[![Known Vulnerabilities](https://snyk.io/test/github/MockingMagician/promised-db/badge.svg)](https://snyk.io/test/github/MockingMagician/promised-db)
[![dependencies](https://img.shields.io/badge/dependencies-free-white.svg)](https://shields.io/)
![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/MockingMagician/promised-db)

**Dependencies**
---------

This package has no dependencies.

**Installation**
---------

To install this package, run the following command in your terminal:

With npm

```
npm install @idxdb/promised
```

With yarn

```
yarn add @idxdb/promised
```

**Foreword**
---------

This package fully respects the original indexedDB API.

The only subtleties are:

- database initialization, to support migrations during version upgrades.

- in the cursors, which allow more natural iteration than the original API.

<details>
  <summary>Detailed interfaces</summary>

```typescript
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
    add<V, K extends IDBValidKey>(value: V, key?: K): Promise<K>
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
    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K>
    put<V, K extends IDBValidKey>(value: V, key?: K): Promise<void>
    indexNames: string[]
}

export interface IndexInterface {
    keyPath: string | string[]
    multiEntry: boolean
    name: string
    objectStore: ObjectStoreInterface
    unique: boolean
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
    openKeyCursor<PK extends IDBValidKey, K extends IDBValidKey>(
        query?: IDBKeyRange | K,
        direction?: IDBCursorDirection
    ): KeyCursorInterface<PK, K>
}

export interface ValueCursorInterface<
    PK extends IDBValidKey,
    K extends IDBValidKey,
    R,
> extends KeyCursorInterface<PK, K> {
    value: R | undefined
    delete(): Promise<void>
    update(value: R): Promise<void>
}

export interface KeyCursorInterface<
    PK extends IDBValidKey,
    K extends IDBValidKey,
> {
    primaryKey: PK | undefined
    key: K | undefined
    direction: IDBCursorDirection
    source: ObjectStoreInterface | IndexInterface
    request: IDBRequest<IDBCursor>
    end(): Promise<boolean>
    continue(key?: K): void
    advance(count: number): void
    continuePrimaryKey(key: K, primaryKey: PK): void
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
```
</details>



**Usage - API**
---------

**Database initialization and migration management**

```typescript
import { DatabaseFactory } from '@idxdb/promised';

const migrations = [
    {
        version: 1,
        migration: async ({db, transaction, dbOldVersion, dbNewVersion, migrationVersion}) => {
            const store = db.createObjectStore('users', { keyPath: 'id' })
            store.createIndex('name_idx', 'name', { unique: false });
        },
    },
    {
        version: 2,
        migration: async ({db, transaction, dbOldVersion, dbNewVersion, migrationVersion}) => {
            const store = transaction.objectStore('users')
            store.createIndex('email_idx', 'email', { unique: true })
        },
    },
    {
        version: 3,
        migration: async ({db, transaction, dbOldVersion, dbNewVersion, migrationVersion}) => {
            const store = transaction.objectStore('users')
            store.createIndex('identifier_idx', 'identifier', { unique: true })
            store.deleteIndex('email_idx')
        },
    },
]

const requestedVersion = 3;

const db = await DatabaseFactory.open('mydatabase', requestedVersion, migrations);
```

**What if I don't have any migrations to keep up to date and I just delete my DB every time I change?**

All you have to do is keep one migration and you're done.

```typescript
import { DatabaseFactory } from '@idxdb/promised';

const requestedVersion = 3; // the version you want to open, increase to open anew one and reset your DB scheme

const migrations = [
    {
        version: requestedVersion,
        migration: async ({db, transaction, dbOldVersion, dbNewVersion, migrationVersion}) => {
            for (const store of db.objectStoreNames) {
                db.deleteObjectStore(store) // correctly delete all previous existing stores
            }
            // creates the fresh new stores and their indexes
            const store = db.createObjectStore('users', { keyPath: 'id' })
            store.createIndex('name_idx', 'name', { unique: false });
            //...
        },
    },
]


const db = await DatabaseFactory.open('mydatabase', requestedVersion, migrations);
```

**What happens if my DB is already open and I try to open another version?**

A basic error message will inform you that the operation is impossible. However, you can take control by adding a handler for the `blocked` event and perform the actions you deem necessary:

- Warn the user
- Inform other tabs
- ...

```typescript
import { DatabaseFactory } from '@idxdb/promised';

let db = await DatabaseFactory.open(dbName, 1)

const bc = new BroadcastChannel('idxdb_channel')

bc.onmessage = (event) => {
    if (event.data.action === 'close-db') {
        db.close();
    }
}

const onBlocked = async ({ oldVersion, newVersion }) => {
    // warn other tabs to close the db
    bc.postMessage({ action: 'close-db' });
    return 'close-db-emitted'
}

db = await DatabaseFactory.open(dbName, 2, [], onBlocked).catch((error) => {
    if (error === 'close-db-emitted') {
        // retry the open
        return  DatabaseFactory.open(dbName, 2)
    }
})
```

**Add some data**
```typescript
import { DatabaseFactory } from '@idxdb/promised';

const db = await DatabaseFactory.open('mydatabase', 1);

const tx = db.transaction(['users'], "readwrite");
const store = tx.objectStore('users');

store.add({ id: 1, name: 'Jane Doe' });

await tx.commit();
```

**Fetch some data**
```typescript
import { DatabaseFactory } from '@idxdb/promised';

const db = await DatabaseFactory.open('mydatabase', 1);

const tx = db.transaction(['users'], "readonly");
const store = tx.objectStore('users');

const result = await store.get(1);
console.log(result.name); // "John Doe"
```

**Iterate over cursor**
```typescript
import { DatabaseFactory } from '@idxdb/promised';

const db = await DatabaseFactory.open('mydatabase', 1);

const tx = db.transaction(['users'], "readonly");
const store = tx.objectStore('users');
const cursor = store.openCursor();

while (!(await cursor.end())) {
    console.log(cursor.value);
    cursor.continue();
}
```

**And all the existing API**

The library implements all the methods of the IndexedDB API, you can find the documentation [here](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

You can also find more examples in the [tests](https://github.com/MockingMagician/promised-db/tree/main/test/component)

**Contributing**
------------

If you'd like to contribute to this package, please follow these steps:

* Fork this repository
* Make your changes and commit them
* Create a pull request with a detailed description of the changes

**License**
---------

This package is licensed under ISC. See the LICENSE file for more information.

**Contact**
----------

If you have any questions or need further assistance, please feel free to reach out to me at [Marc MOREAU](mailto:moreau.marc.web@gmail.com).

**Versioning**
------------

This package uses [SemVer](https://semver.org/) for versioning. For the versions available, see the tags on this repository.
