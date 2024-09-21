import { ComponentTestInitializer } from '../../test-helpers/component-test.initializer'
import { StoreIndex } from '../../../src'
import { ObjectStore } from '../../../src'

describe('key cursor', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
    })

    afterEach(async () => {
        testInitializer.db.close()
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

    it('should get request', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)
        const cursor = objectStore.openKeyCursor()
        expect(cursor.request).toBeInstanceOf(IDBRequest)
    })

    it('return objectStore source', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        const cursor = objectStore.openKeyCursor()
        expect(cursor.source).toBeInstanceOf(ObjectStore)
    })

    it('return direction', async () => {
        const objectStore = await testInitializer.prepareStoreContent(0)

        for (const direction of [
            'next',
            'nextunique',
            'prev',
            'prevunique',
        ] as IDBCursorDirection[]) {
            const cursor = objectStore.openKeyCursor(undefined, direction)
            expect(cursor.direction).toEqual(direction)
        }
    })

    it('can advance', async () => {
        const objectStore = await testInitializer.prepareStoreContent(3)

        const cursor = objectStore.openKeyCursor()
        await cursor.end()
        cursor.advance(2)
        await cursor.end()
        expect(cursor.key).toEqual(3)
    })

    it('continue primaryKey is invalid on objectStore ', async () => {
        const objectStore = await testInitializer.prepareStoreContent(3)

        const cursor = objectStore.openKeyCursor()
        await cursor.end()
        expect(() => cursor.continuePrimaryKey(3, 3)).toThrow()
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

        it('return index source', async () => {
            const objectStore = await testInitializer.prepareStoreContent(3)

            const cursor = objectStore.index('name_idx').openKeyCursor()
            expect(cursor.source).toBeInstanceOf(StoreIndex)
        })

        it('can continuePrimaryKey', async () => {
            const objectStore = await testInitializer.prepareStoreContent(3)

            const cursor = objectStore.index('name_idx').openKeyCursor()
            await cursor.end()
            cursor.continuePrimaryKey('test_3', cursor.primaryKey)
            await cursor.end()
            const value = testInitializer.storeValue(3)
            expect(cursor.key).toEqual(value.name)
            expect(cursor.primaryKey).toEqual(value.id)
        })
    })
})
