import { ComponentTestInitializer } from '../../test-helpers/component-test.initializer'

describe('value cursor', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
    })

    afterEach(async () => {
        testInitializer.db.close()
    })

    it('cursor should not iterate if empty store', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        const cursor = objectStore.openCursor()
        let it = 0
        while (!(await cursor.end())) {
            ++it
            cursor.continue()
        }
        expect(it).toEqual(0)
    })

    it('cursor should iterate over values', async () => {
        const objectStore = await testInitializer.prepareStoreContent(3)

        const cursor = objectStore.openCursor()
        let it = 0
        while (!(await cursor.end())) {
            const value = cursor.value
            expect(value).toEqual(testInitializer.storeValue(++it))
            cursor.continue()
        }
        expect(it).toEqual(3)
    })

    it('delete', async () => {
        const objectStore = await testInitializer.prepareStoreContent(3)

        const cursor = objectStore.openCursor()
        while (!(await cursor.end())) {
            await cursor.delete()
            cursor.continue()
        }

        expect(await objectStore.count()).toEqual(0)
    })

    it('update', async () => {
        const objectStore = await testInitializer.prepareStoreContent(1)

        const cursor = objectStore.openCursor()
        while (!(await cursor.end())) {
            await cursor.update({ id: cursor.primaryKey, name: 'modified' })
            cursor.continue()
        }

        expect(await objectStore.get(1)).toEqual({ id: 1, name: 'modified' })
    })

    describe('in index context', () => {
        it('cursor should iterate over values', async () => {
            const objectStore = await testInitializer.prepareStoreContent(3)

            const cursor = objectStore.index('name_idx').openCursor()
            let it = 0
            while (!(await cursor.end())) {
                ++it
                cursor.continue()
            }
            expect(it).toEqual(3)
        })
    })
})
