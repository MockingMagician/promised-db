require('fake-indexeddb/auto')
import { DatabaseFactory } from '../src/database-factory'
import { randomString } from './test-helpers/random-string'
import { DatabaseInterface } from '../src/component/interface/components.interface'

describe('components', () => {
    let db: DatabaseInterface
    let storeName: string

    let storeInsert = 0
    const storeValue = (compare?: number) => {
        if (compare) {
            return {
                id: compare,
                name: `test_${compare}`,
            }
        }

        return {
            name: `test_${++storeInsert}`,
        }
    }

    const prepareStoreContent = async (numberOfObjects: number) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        while (numberOfObjects--) {
            await objectStore.add(storeValue())
        }
        await transaction.commit()
        return db.transaction(storeName, 'readwrite').objectStore(storeName)
    }

    beforeEach(async () => {
        storeInsert = 0
        storeName = randomString(25)
        db = await DatabaseFactory.open(randomString(25), 1, [
            {
                version: 1,
                upgrade: async ({db}) => {
                    const store = db.createObjectStore(storeName, {
                        keyPath: 'id',
                        autoIncrement: true,
                    })
                    store.createIndex('name_idx', 'name')
                },
            },
        ])
    })

    it('should get all values', async () => {
        const objectStore = await prepareStoreContent(2)

        expect(await objectStore.getAll()).toEqual([
            storeValue(1),
            storeValue(2),
        ])
    })

    it('should get value', async () => {
        const objectStore = await prepareStoreContent(2)

        expect(await objectStore.get(2)).toEqual(storeValue(2))
        expect(await objectStore.get(3)).toEqual(undefined)
    })

    it('should get all keys', async () => {
        const objectStore = await prepareStoreContent(5)

        expect(await objectStore.getAllKeys()).toEqual([1, 2, 3, 4, 5])
        expect(await objectStore.getAllKeys(IDBKeyRange.bound(2, 4))).toEqual([
            2, 3, 4,
        ])
        expect(
            await objectStore.getAllKeys(IDBKeyRange.bound(2, 4, true, true))
        ).toEqual([3])
    })

    it('should get key', async () => {
        const objectStore = await prepareStoreContent(5)

        expect(await objectStore.getKey(3)).toEqual(3)
        expect(await objectStore.getKey(IDBKeyRange.bound(2, 4))).toEqual(2)
        expect(
            await objectStore.getKey(IDBKeyRange.bound(2, 4, true, true))
        ).toEqual(3)
    })

    it('should count', async () => {
        const objectStore = await prepareStoreContent(5)

        expect(await objectStore.count()).toEqual(5)
        expect(await objectStore.count(IDBKeyRange.bound(2, 4))).toEqual(3)
        expect(
            await objectStore.count(IDBKeyRange.bound(2, 4, true, true))
        ).toEqual(1)
    })

    it('cursor should iterate over values', async () => {
        const objectStore = await prepareStoreContent(3)

        const cursor = objectStore.openCursor()
        let it = 0
        while (await cursor.next()) {
            const value = cursor.value()
            expect(value).toEqual(storeValue(++it))
        }
        expect(it).toEqual(3)
    })

    it('cursor should iterate over keys', async () => {
        const objectStore = await prepareStoreContent(3)

        const cursor = objectStore.openKeyCursor()
        let it = 0
        while (await cursor.next()) {
            const value = cursor.key()
            expect(value).toEqual(++it)
        }
        expect(it).toEqual(3)
    })

    it('put should update value', async () => {
        const objectStore = await prepareStoreContent(3)
        await objectStore.put({ id: 2, name: 'modified' })

        expect(await objectStore.get(2)).toEqual({ id: 2, name: 'modified' })
    })

    it('abort transaction should not record entries', async () => {
        //need investigation
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add(storeValue())
        await transaction.abort()

        expect(
            await db
                .transaction(storeName, 'readwrite')
                .objectStore(storeName)
                .count()
        ).toEqual(0)
    })

    it('clear store should be empty', async () => {
        const objectStore = await prepareStoreContent(5)
        await objectStore.clear()

        expect(await objectStore.count()).toEqual(0)
    })

    it('should delete', async () => {
        const objectStore = await prepareStoreContent(5)
        await objectStore.delete(3)

        expect(await objectStore.count()).toEqual(4)
    })

    describe('index', () => {
        it('should count', async () => {
            const objectStore = await prepareStoreContent(5)

            expect(await objectStore.index('name_idx').count()).toEqual(5)
            expect(await objectStore.index('name_idx').count('test_3')).toEqual(
                1
            )
        })

        it('should get', async () => {
            const objectStore = await prepareStoreContent(5)

            expect(await objectStore.index('name_idx').get('test_3')).toEqual(
                storeValue(3)
            )
        })

        it('should getAll', async () => {
            const objectStore = await prepareStoreContent(3)

            expect(await objectStore.index('name_idx').getAll()).toEqual([
                storeValue(1),
                storeValue(2),
                storeValue(3),
            ])
        })

        it('should get key', async () => {
            const objectStore = await prepareStoreContent(5)

            expect(
                await objectStore.index('name_idx').getKey('test_3')
            ).toEqual(3)
        })

        it('should get all keys', async () => {
            const objectStore = await prepareStoreContent(5)

            expect(await objectStore.index('name_idx').getAllKeys()).toEqual([
                1, 2, 3, 4, 5,
            ])
        })

        it('should get all keys', async () => {
            const objectStore = await prepareStoreContent(5)

            expect(await objectStore.index('name_idx').getAllKeys()).toEqual([
                1, 2, 3, 4, 5,
            ])
        })

        it('cursor should iterate over values', async () => {
            const objectStore = await prepareStoreContent(3)

            const cursor = objectStore.index('name_idx').openCursor()
            let it = 0
            while (await cursor.next()) {
                const value = cursor.value()
                expect(value).toEqual(storeValue(++it))
            }
            expect(it).toEqual(3)
        })

        it('cursor should iterate over keys', async () => {
            const objectStore = await prepareStoreContent(3)

            const cursor = objectStore.index('name_idx').openKeyCursor()
            let it = 0
            while (await cursor.next()) {
                const value = storeValue(++it)
                expect(cursor.key()).toEqual(value.name)
                expect(cursor.primaryKey()).toEqual(value.id)
            }
            expect(it).toEqual(3)
        })

        it('cursor should iterate over keys on query', async () => {
            const objectStore = await prepareStoreContent(3)

            const cursor = objectStore.index('name_idx').openKeyCursor('test_2')
            while (await cursor.next()) {
                const value = storeValue(2)
                expect(cursor.key()).toEqual(value.name)
                expect(cursor.primaryKey()).toEqual(value.id)
            }
        })
    })
})
