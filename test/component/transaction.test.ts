import {ComponentTestInitializer} from "../test-helpers/component-test.initializer";

describe('transaction', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
    })

    it('abort transaction should not record entries', async () => {
        const transaction = testInitializer.db.transaction(testInitializer.storeName, 'readwrite')
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
})