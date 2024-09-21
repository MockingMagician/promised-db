import { Transaction } from '@/component/transaction'
import { Database } from '@/component/database'

export type MigrationVersion = number

export interface MigrationInterface {
    version: MigrationVersion
    migration: (migrationCtx: {
        db: Database
        transaction: Transaction
        dbOldVersion: number
        dbNewVersion: number
        migrationVersion: MigrationVersion
    }) => Promise<void>
}

export type OnBlocked = (ctx: {
    oldVersion: number
    newVersion: number
}) => Promise<Error | string>

export class DatabaseFactory {
    private static _factory: IDBFactory
    private static readonly factory: () => IDBFactory = () => {
        if (this._factory) {
            return this._factory
        }
        /* istanbul ignore next */
        if (typeof self !== 'undefined') {
            return (this._factory = self.indexedDB)
        }
        return (this._factory = new IDBFactory())
    }

    static cmp<T>(a: T, b: T): number {
        return this.factory().cmp(a, b)
    }

    static databases(): Promise<IDBDatabaseInfo[]> {
        return this.factory().databases()
    }

    static deleteDatabase(name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.factory().deleteDatabase(name)
            request.addEventListener('success', () => {
                resolve()
            })
            /* istanbul ignore next */
            request.addEventListener('blocked', () => {
                reject('blocked')
            })
            /* istanbul ignore next */
            request.addEventListener('error', (event) => {
                const target = event.target as IDBOpenDBRequest
                reject(target.error)
            })
        })
    }

    static open(
        name: string,
        version: number = 1,
        migrations: MigrationInterface[] = [],
        onBlocked?: OnBlocked
    ): Promise<Database> {
        return new Promise((resolve, reject) => {
            const request: IDBOpenDBRequest = this.factory().open(name, version)

            request.addEventListener('success', (event) => {
                const target = event.target as IDBOpenDBRequest
                resolve(new Database({ db: target.result }))
            })

            /* istanbul ignore next */
            request.addEventListener('error', (event) => {
                const target = event.target as IDBOpenDBRequest
                reject(target.error)
            })

            request.addEventListener('blocked', async (event) => {
                const oldVersion = event.oldVersion
                const newVersion = event.newVersion

                if (!onBlocked) {
                    const error = new Error(
                        `You are not allowed to upgrade the database when it is already active. Prevented from reopening the ${name} database in version ${newVersion} when the current version is ${oldVersion}.`
                    )
                    reject(error)
                    return
                }

                onBlocked({ oldVersion, newVersion })
                    .then((result) => {
                        reject(result)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })

            request.addEventListener('upgradeneeded', async (event) => {
                const target = event.target as IDBOpenDBRequest
                const db = target.result
                const transaction = target.transaction as IDBTransaction
                migrations = migrations.sort((a, b) => a.version - b.version)

                for (const migration of migrations) {
                    if (
                        event.oldVersion < migration.version &&
                        migration.version <= version
                    ) {
                        /* istanbul ignore next */
                        const handleReject = (event: Event) => {
                            const target = event.target as IDBOpenDBRequest
                            reject(target.error)
                        }
                        db.addEventListener('error', handleReject)
                        await migration.migration({
                            db: new Database({ db }),
                            transaction: new Transaction({ transaction }),
                            dbOldVersion: event.oldVersion,
                            dbNewVersion: event.newVersion,
                            migrationVersion: migration.version,
                        })
                        db.removeEventListener('error', handleReject)
                    }
                }
            })
        })
    }
}
