require('fake-indexeddb/auto')
import { DatabaseInterface } from '../../src'
import { randomString } from './random-string'
import { DatabaseFactory } from '../../src'

export class ComponentTestInitializer {
    private _db: DatabaseInterface
    private _storeName: string
    private storeInsert = 0

    get storeName(): string {
        return this._storeName
    }

    get db(): DatabaseInterface {
        return this._db
    }

    async initialize() {
        this.storeInsert = 0
        this._storeName = randomString(25)
        this._db = await DatabaseFactory.open(randomString(25), 1, [
            {
                version: 1,
                migration: async ({ db }) => {
                    const store = db.createObjectStore(this.storeName, {
                        keyPath: 'id',
                        autoIncrement: true,
                    })
                    store.createIndex('name_idx', 'name')
                },
            },
        ])
    }

    prepareStoreContent = async (numberOfObjects: number) => {
        const transaction = this.db.transaction(this.storeName, 'readwrite')
        const objectStore = transaction.objectStore(this.storeName)
        while (numberOfObjects--) {
            await objectStore.add(this.storeValue())
        }
        await transaction.commit()
        return this.db
            .transaction(this.storeName, 'readwrite')
            .objectStore(this.storeName)
    }

    storeValue(compare?: number) {
        if (compare) {
            return {
                id: compare,
                name: `test_${compare}`,
            }
        }

        return {
            name: `test_${++this.storeInsert}`,
        }
    }
}
