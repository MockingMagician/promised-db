require('fake-indexeddb/auto')
import { DatabaseFactory, MigrationInterface, OnBlocked } from '../../src'
import { Database } from '../../src'
import { randomString } from '../test-helpers/random-string'

describe('DatabaseFactory', () => {
    it('should compare keys', () => {
        const compare = DatabaseFactory.cmp(1, 2)
        expect(compare).toEqual(-1)
    })

    it('should open a database', async () => {
        const database = await DatabaseFactory.open(randomString(25))
        expect(database).toBeInstanceOf(Database)
        database.close()
    })

    it('should open a database with version upgrade up to the requested version', async () => {
        const versionUpgradeOrder: number[] = []
        const storeToDeleteInAFutureVersion = randomString(25)
        const indexToDeleteInAFutureVersion = randomString(25)
        const dbName = randomString(25)

        const migrations: MigrationInterface[] = [
            {
                version: 1,
                migration: async ({ db, migrationVersion }) => {
                    const store = db.createObjectStore('test')
                    // very long process
                    for (let i = 0; i < 100; i++) {
                        store.createIndex(randomString(50), randomString(50))
                    }
                    versionUpgradeOrder.push(migrationVersion)
                },
            },
            {
                version: 2,
                migration: async ({ db, migrationVersion }) => {
                    db.createObjectStore(storeToDeleteInAFutureVersion)
                    versionUpgradeOrder.push(migrationVersion)
                },
            },
            {
                version: 3,
                migration: async ({ db, migrationVersion }) => {
                    db.deleteObjectStore(storeToDeleteInAFutureVersion)
                    const store = db.createObjectStore('test2')
                    store.createIndex(
                        indexToDeleteInAFutureVersion,
                        randomString(50)
                    )
                    versionUpgradeOrder.push(migrationVersion)
                },
            },
            {
                version: 4,
                migration: async ({ transaction, migrationVersion }) => {
                    transaction
                        .objectStore('test2')
                        .deleteIndex(indexToDeleteInAFutureVersion)
                    versionUpgradeOrder.push(migrationVersion)
                },
            },
        ]

        let db = await DatabaseFactory.open(dbName, 2, migrations)
        expect(db).toBeDefined()
        expect(versionUpgradeOrder).toEqual([1, 2])

        db.close()
        versionUpgradeOrder.length = 0 // reset array

        db = await DatabaseFactory.open(dbName, 4, migrations)
        expect(db).toBeDefined()
        expect(versionUpgradeOrder).toEqual([3, 4])
        db.close()
    })

    it('should throw an error when requested a new version of db while already using it', async () => {
        const dbName = randomString(25)
        const db = await DatabaseFactory.open(dbName, 1)
        await expect(DatabaseFactory.open(dbName, 2)).rejects.toThrow()
        db.close()
    })

    it('should NOT throw an error if requested a new version and the previous was closed', async () => {
        const dbName = randomString(25)
        const db = await DatabaseFactory.open(dbName, 1)
        db.close()
        await expect(DatabaseFactory.open(dbName, 2)).resolves.toBeInstanceOf(
            Database
        )
    })

    it('should manage when requested a new version of db while already using it', async () => {
        const dbName = randomString(25)
        const db = await DatabaseFactory.open(dbName, 1)

        const onBlocked: OnBlocked = async ({ oldVersion, newVersion }) => {
            // warn other tabs to close the db
            db.close()
            return `informed to close the db version ${oldVersion} before opening version ${newVersion}`
        }

        const retryOpenDB = await DatabaseFactory.open(
            dbName,
            2,
            [],
            onBlocked
        ).catch((error) => {
            expect(error).toEqual(
                'informed to close the db version 1 before opening version 2'
            )
            return DatabaseFactory.open(dbName, 2)
        })

        expect(retryOpenDB).toBeInstanceOf(Database)
    })

    it('should delete databases', async () => {
        const dbName = randomString(25)
        const db = await DatabaseFactory.open(dbName)
        db.close()

        await DatabaseFactory.deleteDatabase(dbName)
        expect(
            (await DatabaseFactory.databases()).map((dbInfos) => dbInfos.name)
        ).not.toContain(dbName)
    })

    it('should show created databases', async () => {
        const databaseNames = [
            randomString(25),
            randomString(25),
            randomString(25),
        ]
        for (const name of databaseNames) {
            const db = await DatabaseFactory.open(name)
            db.close()
        }
        const existingDatabases = (await DatabaseFactory.databases()).map(
            (dbInfos) => dbInfos.name
        )
        for (const database of databaseNames) {
            expect(existingDatabases).toContain(database)
        }
    })

    it('should gives store names', async () => {
        const dbName = randomString(25)
        const db = await DatabaseFactory.open(dbName, 1, [
            {
                version: 1,
                migration: async ({ db }) => {
                    db.createObjectStore('store1')
                    db.createObjectStore('store2')
                },
            },
        ])

        expect(db.objectStoreNames).toEqual(['store1', 'store2'])
    })
})
