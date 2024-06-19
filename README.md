**Overview**
----------

**@idexeddb/promised-db** is a lightweight library that wraps the IndexedDB API, providing a more natural way to work with promises. It allows you to easily store and retrieve data in an indexed database using async/await syntax, making it easier to integrate with your existing codebase.

**Installation**
--------------

To install this package, run the following command in your terminal:

```
npm install @idexeddb/promised-db
```

**Usage**
---------

**Create database**
```javascript
import { DatabaseFactory } from '@idexeddb/promised-db';

const db = await DatabaseFactory.open('mydatabase', 1);

const store = db.createObjectStore('users', { keyPath: 'id' });
```

**Add some data**
```javascript
import { DatabaseFactory } from '@idexeddb/promised-db';

const db = await DatabaseFactory.open('mydatabase', 1);

const tx = db.transaction(['users'], "readwrite");
const store = tx.objectStore('users');

store.add({ id: 1, name: 'Jane Doe' });

await tx.commit();
```

**Fetch some data**
```javascript
import { DatabaseFactory } from '@idexeddb/promised-db';

const db = await DatabaseFactory.open('mydatabase', 1);

const tx = db.transaction(['users'], "readonly");
const store = tx.objectStore('users');

const result = await store.get(1);
console.log(result.name); // "John Doe"
```

**Manage database versions**
```javascript
import { DatabaseFactory } from '@idexeddb/promised-db';

const versions = [
    {
        version: 1,
        upgrade: async (db) => {
            const store = db.createObjectStore('users', { keyPath: 'id' });
            store.createIndex('name_idx', 'name', { unique: false });
        },
    },
    {
        version: 2,
        upgrade: async (db) => {
            const store = db.objectStore('users')
            store.createIndex('email_idx', 'email', { unique: true });
        },
    },
]

const db = await DatabaseFactory.open('mydatabase', 2, versions);
```

**Dependencies**
-------------

This package has no dependencies.

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
