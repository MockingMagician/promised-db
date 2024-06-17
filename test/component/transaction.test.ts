require('fake-indexeddb/auto')
import { DatabaseFactory } from '../../src/database-factory'
import { randomString } from '../test-helpers/random-string'
import { DatabaseInterface } from '../../src/component/interface/components.interface'

describe('Transaction', () => {
    let db: DatabaseInterface
    let storeName: string

    let storeInsert = 0
    const storeValue = (compare?: number) => {
        if (compare) {
            return {
                id: compare,
                name: `test_${compare}`
            }
        }

        return {
            name: `test_${++storeInsert}`
        }
    }

    beforeEach(async () => {
        storeInsert = 0
        storeName = randomString(25)
        db = await DatabaseFactory.open(randomString(25), 1, [
            {
                version: 1,
                upgrade: async (db) => {
                    db.createObjectStore(storeName, {
                        keyPath: 'id',
                        autoIncrement: true,
                    })
                },
            },
        ])
    })

    it('should get all values', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())

        expect(await objectStore.getAll()).toEqual([
            storeValue(1),
            storeValue(2),
        ])
    })

    it('should get value', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())

        expect(await objectStore.get(2)).toEqual(storeValue(2))
        expect(await objectStore.get(3)).toEqual(undefined)
    })

    it('should get all keys', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())

        expect(await objectStore.getAllKeys()).toEqual([1, 2, 3, 4, 5])
        expect(await objectStore.getAllKeys(IDBKeyRange.bound(2,4))).toEqual([2, 3, 4])
        expect(await objectStore.getAllKeys(IDBKeyRange.bound(2,4, true,  true))).toEqual([3])
    })

    it('should get key', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())

        expect(await objectStore.getKey(3)).toEqual(3)
        expect(await objectStore.getKey(IDBKeyRange.bound(2,4))).toEqual(2)
        expect(await objectStore.getKey(IDBKeyRange.bound(2,4, true,  true))).toEqual(3)
    })

    it('should count', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())

        expect(await objectStore.count()).toEqual(5)
        expect(await objectStore.count(IDBKeyRange.bound(2,4))).toEqual(3)
        expect(await objectStore.count(IDBKeyRange.bound(2,4, true,  true))).toEqual(1)
    })

    it('cursor should iterate over values', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())

        const cursor = objectStore.openCursor()
        let it = 0;
        while (await cursor.next()) {
            const value = cursor.value()
            expect(value).toEqual(storeValue(++it))
        }
        expect(it).toEqual(3)
    })

    it('cursor should iterate over keys', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())
        await objectStore.add(storeValue())

        const cursor = objectStore.openKeyCursor()
        let it = 0;
        while (await cursor.next()) {
            const value = cursor.key()
            expect(value).toEqual(++it)
        }
        expect(it).toEqual(3)
    })
})
