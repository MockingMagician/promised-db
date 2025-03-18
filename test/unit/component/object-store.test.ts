import { ComponentTestInitializer } from '../../test-helpers/component-test.initializer'
import { Transaction } from '../../../src'

describe('object store', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
    })

    afterEach(async () => {
        testInitializer.db.close()
    })

    it('should get all values', async () => {
        const objectStore = await testInitializer.prepareStoreContent(2)

        expect(await objectStore.getAll()).toEqual([
            testInitializer.storeValue(1),
            testInitializer.storeValue(2),
        ])
    })

    it('should get value', async () => {
        const objectStore = await testInitializer.prepareStoreContent(2)

        expect(await objectStore.get(2)).toEqual(testInitializer.storeValue(2))
        expect(await objectStore.get(3)).toEqual(undefined)
    })

    it('should get all keys', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)

        expect(await objectStore.getAllKeys()).toEqual([1, 2, 3, 4, 5])
        expect(await objectStore.getAllKeys(IDBKeyRange.bound(2, 4))).toEqual([
            2, 3, 4,
        ])
        expect(
            await objectStore.getAllKeys(IDBKeyRange.bound(2, 4, true, true))
        ).toEqual([3])
    })

    it('should get key', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)

        expect(await objectStore.getKey<number>(3)).toEqual(3)
        expect(await objectStore.getKey(IDBKeyRange.bound(2, 4))).toEqual(2)
        expect(
            await objectStore.getKey(IDBKeyRange.bound(2, 4, true, true))
        ).toEqual(3)
    })

    it('should count', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)

        expect(await objectStore.count()).toEqual(5)
        expect(await objectStore.count(IDBKeyRange.bound(2, 4))).toEqual(3)
        expect(
            await objectStore.count(IDBKeyRange.bound(2, 4, true, true))
        ).toEqual(1)
    })

    it('put should update value', async () => {
        const objectStore = await testInitializer.prepareStoreContent(3)
        await objectStore.put({ id: 2, name: 'modified' })

        expect(await objectStore.get(2)).toEqual({ id: 2, name: 'modified' })
    })

    it('clear store should be empty', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)
        await objectStore.clear()

        expect(await objectStore.count()).toEqual(0)
    })

    it('should delete', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)
        await objectStore.delete(3)

        expect(await objectStore.count()).toEqual(4)
    })

    it('add should return key', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)
        const key = await objectStore.add(testInitializer.storeValue(123))

        expect(key).toEqual(123)
    })

    it('get indexes names', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.indexNames).toEqual(['name_idx'])
    })

    it('get keyPath', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.keyPath).toEqual('id')
    })

    it('get autoIncrement', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.autoIncrement).toEqual(true)
    })

    it('get name', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.name).toBeDefined()
    })

    it('get transaction', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.transaction).toBeInstanceOf(Transaction)
    })
})
