import { ComponentTestInitializer } from '../../test-helpers/component-test.initializer'
import {DatabaseFactory} from '../../../src'
import {randomUUID} from "node:crypto";

describe('???', () => {
    const testInitializer = new ComponentTestInitializer()

    beforeEach(async () => {
        await testInitializer.initialize()
    })

    afterEach(async () => {
        testInitializer.db.close()
    })

    it('???', async () => {
        const name = Math.random().toString(36).substring(3)
        const version = 1

        let db = await DatabaseFactory.open(name, version, [
            {
                version: 1,
                migration: async ({ db }) => {
                    const store1 = db.createObjectStore('store1', { keyPath: 'key' })
                    store1.createIndex('itemID', 'itemID')
                    const store2 = db.createObjectStore('store2', { keyPath: 'key' })
                    store2.createIndex('itemID', 'itemID')
                },
            },
        ])

        const transaction = db.transaction(['store1', 'store2'], 'readwrite')

        const store1 = transaction.objectStore('store1')
        await store1.add({ key: 1, itemID: 1 })
        const store2 = transaction.objectStore('store2')
        await store2.add({ key: 1, itemID: 1 })

        const deletes = []
        for (const i of [1, 2]) {
            const store = transaction.objectStore(`store${i}`)
            const index = store.index('itemID')
            const cursor = index.openCursor(IDBKeyRange.only(1))
            while (!(await cursor.end())) {
                deletes.push(store.delete(cursor.primaryKey))
                cursor.continue()
            }
        }

        expect(deletes.length).toEqual(2)
        if (deletes.length) {
            const settled = await Promise.allSettled(deletes)
            expect(settled.length).toEqual(2)
        }

        await transaction.commit()
        db.close()
        return true
    })
})