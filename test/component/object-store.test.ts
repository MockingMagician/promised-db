import {ComponentTestInitializer} from "../test-helpers/component-test.initializer";

describe('object store', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
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

        expect(await objectStore.getKey(3)).toEqual(3)
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
})