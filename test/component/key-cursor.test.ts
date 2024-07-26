import { ComponentTestInitializer } from '../test-helpers/component-test.initializer'

describe('key cursor', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
    })

    it('cursor should iterate over keys', async () => {
        const objectStore = await testInitializer.prepareStoreContent(3)

        const cursor = objectStore.openKeyCursor()
        let it = 0
        while (!(await cursor.end())) {
            const value = cursor.key
            expect(value).toEqual(++it)
            cursor.continue()
        }
        expect(it).toEqual(3)
    })

    describe('in index context', () => {
        it('cursor should iterate over keys', async () => {
            const objectStore = await testInitializer.prepareStoreContent(3)

            const cursor = objectStore.index('name_idx').openKeyCursor()
            let it = 0
            while (!(await cursor.end())) {
                const value = testInitializer.storeValue(++it)
                expect(cursor.key).toEqual(value.name)
                expect(cursor.primaryKey).toEqual(value.id)
                cursor.continue()
            }
            expect(it).toEqual(3)
        })

        it('cursor should iterate over keys on query', async () => {
            const objectStore = await testInitializer.prepareStoreContent(3)

            const cursor = objectStore.index('name_idx').openKeyCursor('test_2')
            while (!(await cursor.end())) {
                const value = testInitializer.storeValue(2)
                expect(cursor.key).toEqual(value.name)
                expect(cursor.primaryKey).toEqual(value.id)
                cursor.continue()
            }
        })
    })
})
