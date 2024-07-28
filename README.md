**Overview**
----------

**@idxdb/promised** is a lightweight library that wraps the IndexedDB API, providing a more natural way to work with promises. It allows you to easily store and retrieve data in an indexed database using async/await syntax, making it easier to integrate with your existing codebase.

[![test](https://github.com/MockingMagician/promised-db/actions/workflows/test-and-deploy.yaml/badge.svg)](https://github.com/MockingMagician/promised-db/actions/workflows/test-and-deploy.yaml)
[![npm version](https://badge.fury.io/js/%40idxdb%2Fpromised.svg)](https://badge.fury.io/js/%40idxdb%2Fpromised)

**Dependencies**
-------------

This package has no dependencies.

**Installation**
--------------

To install this package, run the following command in your terminal:

```
npm install @idxdb/promised
```

**Usage examples**
---------

**Create database**
```typescript
import { DatabaseFactory } from '@idxdb/promised';

const db = await DatabaseFactory.open('mydatabase', 1);

const store = db.createObjectStore('users', { keyPath: 'id' });
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

**Manage database versions**
```typescript
import { DatabaseFactory } from '@idxdb/promised';

const versions = [
    {
        version: 1,
        upgrade: async ({db, transaction, currentVersionUpgrade}) => {
            const store = db.createObjectStore('users', { keyPath: 'id' })
            store.createIndex('name_idx', 'name', { unique: false });
        },
    },
    {
        version: 2,
        upgrade: async ({db, transaction, currentVersionUpgrade}) => {
            const store = transaction.objectStore('users')
            store.createIndex('email_idx', 'email', { unique: true })
        },
    },
    {
        version: 3,
        upgrade: async ({db, transaction, currentVersionUpgrade}) => {
            const store = transaction.objectStore('users')
            store.createIndex('identifier_idx', 'identifier', { unique: true })
            store.deleteIndex('email_idx')
        },
    },
]

const db = await DatabaseFactory.open('mydatabase', 3, versions);
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
