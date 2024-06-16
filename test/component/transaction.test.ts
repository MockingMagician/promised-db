import { DatabaseInterface } from '../../src/component/interface/components.interface'

require('fake-indexeddb/auto')
import { DatabaseFactory } from '../../src/database-factory'
import {randomString} from "../test-helpers/random-string";

describe('Transaction', () => {
    let db: DatabaseInterface
    let storeName: string

    beforeEach(async () => {
        storeName = randomString(25)
        db = await DatabaseFactory.open(randomString(25), 1, [
            {
                version: 1,
                upgrade: async (db) => {
                    db.createObjectStore(storeName, {
                        keyPath: 'id',
                        autoIncrement: true,
                    })
                },
            },
        ])
    })

    it('should record value', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add({ name: 'test' })
        const storeValues = await objectStore.getAll()
        expect(storeValues.length).toEqual(1)
        expect(storeValues[0]).toEqual({ id: 1, name: 'test' })
    })

    it('should get key', async () => {
        const transaction = db.transaction(storeName, 'readwrite')
        const objectStore = transaction.objectStore(storeName)
        await objectStore.add({ name: 'test' })
        const storeValues = await objectStore.getAll()
        expect(storeValues.length).toEqual(1)
        expect(storeValues[0]).toEqual({ id: 1, name: 'test' })
    })
})
