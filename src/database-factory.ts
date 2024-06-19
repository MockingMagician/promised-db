import { DatabaseInterface } from '@/component/interface/components.interface'
import { IDBFactory } from 'fake-indexeddb'
import { Database } from '@/component/database'

export type CurrentVersionUpgrade = number

export interface VersionUpgradeInterface {
    version: CurrentVersionUpgrade
    upgrade: (
        db: DatabaseInterface,
        currentVersionUpgrade: CurrentVersionUpgrade
    ) => Promise<void>
}

export class DatabaseFactory {
    static cmp<T>(a: T, b: T): number {
        return new IDBFactory().cmp(a, b)
    }

    static databases(): Promise<IDBDatabaseInfo[]> {
        return new IDBFactory().databases()
    }

    static deleteDatabase(name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = new IDBFactory().deleteDatabase(name)
            request.addEventListener('success', () => {
                resolve()
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
    ): Promise<DatabaseInterface> {
        return new Promise((resolve, reject) => {
            const request: IDBOpenDBRequest = new IDBFactory().open(
                name,
                version
            )

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
                versionUpgrades = versionUpgrades.sort(
                    (a, b) => a.version - b.version
                )

                for (const upgrade of versionUpgrades) {
                    if (event.oldVersion < upgrade.version) {
                        const db = target.result
                        /* istanbul ignore next */
                        const handleReject = (event: Event) => {
                            const target = event.target as IDBOpenDBRequest
                            reject(target.error)
                        }
                        db.addEventListener('error', handleReject)
                        await upgrade.upgrade(
                            new Database({ db }),
                            upgrade.version
                        )
                        db.removeEventListener('error', handleReject)
                    }
                }
            })
        })
    }
}
