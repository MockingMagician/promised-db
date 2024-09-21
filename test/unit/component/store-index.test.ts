import { ComponentTestInitializer } from '../../test-helpers/component-test.initializer'

describe('key cursor', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
    })

    afterEach(async () => {
        testInitializer.db.close()
    })

    it('should count', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)

        expect(await objectStore.index('name_idx').count()).toEqual(5)
        expect(await objectStore.index('name_idx').count('test_3')).toEqual(1)
    })

    it('should get', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)

        expect(await objectStore.index('name_idx').get('test_3')).toEqual(
            testInitializer.storeValue(3)
        )
    })

    it('should getAll', async () => {
        const objectStore = await testInitializer.prepareStoreContent(3)

        expect(await objectStore.index('name_idx').getAll()).toEqual([
            testInitializer.storeValue(1),
            testInitializer.storeValue(2),
            testInitializer.storeValue(3),
        ])
    })

    it('should get key', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)

        expect(await objectStore.index('name_idx').getKey('test_3')).toEqual(3)
    })

    it('should get all keys', async () => {
        const objectStore = await testInitializer.prepareStoreContent(5)

        expect(await objectStore.index('name_idx').getAllKeys()).toEqual([
            1, 2, 3, 4, 5,
        ])
    })

    it('should get keyPath', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.index('name_idx').keyPath).toEqual('name')
    })

    it('should get multiEntry', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.index('name_idx').multiEntry).toEqual(false)
    })

    it('should get name', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.index('name_idx').name).toEqual('name_idx')
    })

    it('should get unique', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.index('name_idx').unique).toEqual(false)
    })

    it('should get objectStore', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        expect(objectStore.index('name_idx').objectStore).toEqual(objectStore)
    })
})
