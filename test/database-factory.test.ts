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
        const storeToDeleteInAFutureVersion = randomString(25)

        const db = await DatabaseFactory.open(randomString(10), 2, [
            {
                version: 1,
                upgrade: async (db, currentVersionUpgrade) => {
                    const store = db.createObjectStore(randomString(10))
                    // very long process
                    for (let i = 0; i < 100; i++) {
                        store.createIndex(randomString(50), randomString(50))
                    }
                    store.createIndex('to_delete_idx', 'to_delete_key')
                    store.deleteIndex('to_delete_idx')
                    versionUpgradeOrder.push(currentVersionUpgrade)
                },
            },
            {
                version: 2,
                upgrade: async (db, currentVersionUpgrade) => {
                    db.createObjectStore(storeToDeleteInAFutureVersion)
                    versionUpgradeOrder.push(currentVersionUpgrade)
                },
            },
            {
                version: 3,
                upgrade: async (db, currentVersionUpgrade) => {
                    db.deleteObjectStore(storeToDeleteInAFutureVersion)
                    versionUpgradeOrder.push(currentVersionUpgrade)
                },
            },
        ])
        expect(db).toBeDefined()
        expect(versionUpgradeOrder).toEqual([1, 2, 3])
        db.close()
    })

    it('should delete databases', async () => {
        const dbName = randomString(25)
        await DatabaseFactory.open(dbName)

        await DatabaseFactory.deleteDatabase(dbName)
        expect((await DatabaseFactory.databases()).length).toEqual(0)
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
