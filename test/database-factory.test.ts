require('fake-indexeddb/auto')
import { DatabaseFactory } from '../src/database-factory'
import { Database } from '../src/component/database'
import { randomString } from './test-helpers/random-string'

describe('DatabaseFactory', () => {
    it('should compare keys', () => {
        const compare = DatabaseFactory.cmp(1, 2)
        expect(compare).toEqual(-1)
    })

    it('should open a database', async () => {
        const database = await DatabaseFactory.open(randomString(25))
        expect(database).toBeInstanceOf(Database)
    })

    it('should open a database with version upgrade', async () => {
        const versionUpgradeOrder: number[] = []

        const db = await DatabaseFactory.open(randomString(10), 2, [
            {
                version: 1,
                upgrade: async (db) => {
                    const store = db.createObjectStore(randomString(10))
                    // very long process
                    for (let i = 0; i < 100; i++) {
                        store.createIndex(randomString(50), randomString(50))
                    }
                    versionUpgradeOrder.push(1)
                },
            },
            {
                version: 2,
                upgrade: async (db) => {
                    db.createObjectStore(randomString(10))
                    versionUpgradeOrder.push(2)
                },
            },
        ])
        expect(db).toBeDefined()
        expect(versionUpgradeOrder).toEqual([1, 2])
        db.close()
    })

    /**
     * This test is skipped because it requires a real IndexedDB implementation
     */
    it.skip('should show created databases', async () => {
        const databaseNames = [
            randomString(25),
            randomString(25),
            randomString(25),
        ]
        for (const name of databaseNames) {
            await DatabaseFactory.open(name)
        }
        const existingDatabases = await DatabaseFactory.databases()
        expect(existingDatabases.length).toEqual(databaseNames.length)
        expect(existingDatabases.map((database) => database.name)).toEqual(
            databaseNames
        )
    })
})
