import type { DatabaseFactory as DF } from '../../../src'
import {
    InWebBrowserContext,
    performInWebBrowserContext,
} from '../../test-helpers/web-browser-context'
import { test, expect } from '@playwright/test'

test.describe('browser environment', () => {

    test('zotero cache class', async ({ page }) => {
        const toPerform: InWebBrowserContext<unknown> = async (
            df: typeof DF
        ) => {
            const Cache = new class $Cache {
                public name = 'BetterBibTeXCache'
                public version = 10

                private db: Awaited<ReturnType<typeof DF['open']>>

                private async $open(action: string): Promise<ReturnType<typeof DF['open']>> {
                    try {
                        return await df.open(this.name, this.version, [{
                            version: this.version,
                            migration: async ({ db, dbOldVersion, dbNewVersion }) => { // eslint-disable-line @typescript-eslint/require-await
                                if (typeof dbNewVersion !== 'number') {
                                    console.info(`cache: creating ${dbNewVersion}`)
                                }
                                else {
                                    console.info(`cache: upgrading ${dbOldVersion} => ${dbNewVersion}`)
                                }
                                for (const store of db.objectStoreNames) {
                                    db.deleteObjectStore(store)
                                }

                                db.createObjectStore('ZoteroSerialized', { keyPath: 'itemID' })
                                db.createObjectStore('touched')
                                db.createObjectStore('metadata', { keyPath: 'key' })

                                const context = db.createObjectStore('ExportContext', { keyPath: 'id', autoIncrement: true })
                                context.createIndex('context', 'context', { unique: true })

                                const stores = [
                                    db.createObjectStore('BetterBibTeX', { keyPath: [ 'context', 'itemID' ]}),
                                    db.createObjectStore('BetterBibLaTeX', { keyPath: [ 'context', 'itemID' ]}),
                                    db.createObjectStore('BetterCSLJSON', { keyPath: [ 'context', 'itemID' ]}),
                                    db.createObjectStore('BetterCSLYAML', { keyPath: [ 'context', 'itemID' ]}),
                                ]
                                for (const store of stores) {
                                    store.createIndex('context', 'context')
                                    store.createIndex('itemID', 'itemID')
                                    store.createIndex('context-itemID', [ 'context', 'itemID' ], { unique: true })
                                }
                            },
                        }])
                    }
                    catch (err) {
                        console.error(`cache: ${action} ${this.version} failed: ${err.message}\n${err.stack}`)
                        return null
                    }
                }

                private async metadata(): Promise<Record<string, string>> {
                    return {}
                }

                public async open(lastUpdated?: string): Promise<void> {
                    if (this.db) throw new Error('database reopened')

                    this.db = await this.$open('open')
                    if (!this.db) {
                        console.info('cache: could not open, delete and reopen') // #2995, downgrade 6 => 7
                        await df.deleteDatabase(this.name)
                        this.db = await this.$open('reopen')
                    }

                    const worker = 'Worker' in self
                    const Zotero = 'Zotero' in self ? self.Zotero as { version: string, Prefs: { get: (key: string) => boolean, clear: (key: string) => void } } : {
                        version: '5.0.0',
                        Prefs: {
                            get: () => false,
                            clear: () => false,
                        },
                    }
                    const version = '5.1.1'

                    if (this.db && !worker) {
                        const del = 'extensions.zotero.translators.better-bibtex.cache.delete'
                        const metadata = { Zotero: '', BetterBibTeX: '', lastUpdated: '', ...(await this.metadata()) }
                        const reasons = [
                            { reason: `Zotero version changed from ${metadata.Zotero || 'none'} to ${Zotero.version}`, test: metadata.Zotero && metadata.Zotero !== metadata.Zotero },
                            { reason: `Better BibTeX version changed from ${metadata.BetterBibTeX || 'none'} to ${version}`, test: metadata.BetterBibTeX && metadata.BetterBibTeX !== version },
                            { reason: `cache gap found ${metadata.lastUpdated} => ${lastUpdated}`, test: (lastUpdated || false) && metadata.lastUpdated && lastUpdated !== metadata.lastUpdated },
                            { reason: 'marked for deletion', test: Zotero.Prefs.get(del) || false },
                        ]
                        const reason = reasons.filter(r => r.test).map(r => r.reason).join(' and ') || false
                        Zotero.Prefs.clear(del)

                        console.info(`cache: ${JSON.stringify(metadata)} + ${JSON.stringify({ Zotero: Zotero.version, BetterBibTeX: version, lastUpdated })} => ${JSON.stringify(reasons)} => ${reason}`)
                        if (reason) {
                            console.info(`cache: reopening because ${reason}`)
                            this.db.close()
                            await df.deleteDatabase(this.name)
                            this.db = await this.$open('upgrade')
                        }
                        const tx = this.db.transaction('metadata', 'readwrite')
                        const store = tx.objectStore('metadata')
                        await store.put({ key: 'Zotero', value: Zotero.version })
                        await store.put({ key: 'BetterBibTeX', value: version })
                        await tx.commit()
                    }
                }

                public close(): void {
                    this.db?.close()
                    this.db = null
                }
            }

            await Cache.open()

            return df.databases()
        }

        const data = await performInWebBrowserContext<unknown>(page, toPerform)

        expect(data).toEqual([{"name": "BetterBibTeXCache", "version": 10}])
    })
})
