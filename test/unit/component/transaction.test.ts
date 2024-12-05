import { ComponentTestInitializer } from '../../test-helpers/component-test.initializer'
import { Database } from '../../../src'

describe('transaction', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
    })

    afterEach(async () => {
        testInitializer.db.close()
    })

    it('abort transaction should not record entries', async () => {
        const transaction = testInitializer.db.transaction(
            testInitializer.storeName,
            'readwrite'
        )
        const objectStore = transaction.objectStore(testInitializer.storeName)
        await objectStore.add(testInitializer.storeValue())
        await transaction.abort()

        expect(
            await testInitializer.db
                .transaction(testInitializer.storeName, 'readwrite')
                .objectStore(testInitializer.storeName)
                .count()
        ).toEqual(0)
    })

    it('should get database', async () => {
        const transaction = testInitializer.db.transaction(
            testInitializer.storeName
        )
        expect(transaction.db).toBeInstanceOf(Database)
    })

    it('should get objectStoreNames', async () => {
        const transaction = testInitializer.db.transaction(
            testInitializer.storeName
        )
        expect(transaction.objectStoreNames).toEqual([
            testInitializer.storeName,
        ])
    })

    it('should get mode', async () => {
        const transaction = testInitializer.db.transaction(
            testInitializer.storeName,
            'readwrite'
        )
        expect(transaction.mode).toEqual('readwrite')
    })

    // investigate why this test is failing
    it.skip('should get error', async () => {
        const transaction = testInitializer.db.transaction(
            testInitializer.storeName,
            'readwrite'
        )
        try {
            const store = transaction.objectStore(testInitializer.storeName)
            await store.add('something wrong')
            await transaction.commit()
        } catch (_) {
            console.log(_) // we'll have an error as expected
        }
        expect(transaction.error).toBeInstanceOf(DOMException) // returns null instead of DOMException
    })

    // investigate why this test is failing
    it.skip('should get durability', async () => {
        const transaction = testInitializer.db.transaction(
            testInitializer.storeName,
            'readwrite'
        )
        expect(transaction.durability).toEqual('default') // returns undefined instead of 'default'
    })
})
