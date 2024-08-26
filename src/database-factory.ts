import { Transaction } from '@/component/transaction'
import { Database } from '@/component/database'

export type CurrentVersionUpgrade = number

export interface VersionUpgradeInterface {
    version: CurrentVersionUpgrade
    upgrade: (upgradeCtx: {
        db: Database
        transaction: Transaction
        currentVersionUpgrade: CurrentVersionUpgrade
    }) => Promise<void>
}

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
        versionUpgrades: VersionUpgradeInterface[] = []
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

            request.addEventListener('upgradeneeded', async (event) => {
                const target = event.target as IDBOpenDBRequest
                const db = target.result
                const transaction = target.transaction as IDBTransaction
                versionUpgrades = versionUpgrades.sort(
                    (a, b) => a.version - b.version
                )

                for (const upgrade of versionUpgrades) {
                    if (event.oldVersion < upgrade.version) {
                        /* istanbul ignore next */
                        const handleReject = (event: Event) => {
                            const target = event.target as IDBOpenDBRequest
                            reject(target.error)
                        }
                        db.addEventListener('error', handleReject)
                        await upgrade.upgrade({
                            db: new Database({ db }),
                            transaction: new Transaction({ transaction }),
                            currentVersionUpgrade: upgrade.version,
                        })
                        db.removeEventListener('error', handleReject)
                    }
                }
            })
        })
    }
}
