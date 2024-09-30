import type { DatabaseFactory as DF } from '../../../src'
import {
    InWebBrowserContext,
    performInWebBrowserContext,
} from '../../test-helpers/web-browser-context'
import { test, expect } from '@playwright/test'

test.describe('browser environment', () => {
    test('can create a database and record into it', async ({ page }) => {
        const toPerform: InWebBrowserContext<
            { id: number; name: string }[]
        > = async (df: typeof DF) => {
            const dbName = Math.random().toString(36).substring(3)
            const db = await df.open(dbName, 1, [
                {
                    version: 1,
                    migration: async ({ db }) => {
                        const store = db.createObjectStore('test', {
                            keyPath: 'id',
                            autoIncrement: true,
                        })
                        store.createIndex('name_idx', 'name')
                    },
                },
            ])
            await db
                .transaction('test', 'readwrite')
                .objectStore('test')
                .add({ name: 'test' })
            const all = await db
                .transaction('test')
                .objectStore('test')
                .getAll()
            db.close()
            return all as { id: number; name: string }[]
        }

        const data = await performInWebBrowserContext<
            { id: number; name: string }[]
        >(page, toPerform)

        expect(data).toEqual([{ id: 1, name: 'test' }])
    })

    test('async migration', async ({ page }) => {
        const toPerform: InWebBrowserContext<unknown> = async (
            df: typeof DF
        ) => {
            const name = Math.random().toString(36).substring(3)
            const version = 1

            let db = await df.open(name, version, [
                {
                    version: 1,
                    migration: async ({ db }) => {
                        db.createObjectStore('metadata', { keyPath: 'key' })
                    },
                },
            ])

            const transaction = db.transaction('metadata', 'readwrite')

            for (let i = 0; i < 10; i++) {
                await transaction
                    .objectStore('metadata')
                    .add({ key: i, value: i })
            }

            await transaction.commit()
            db.close()

            db = await df.open(name, version + 1, [
                {
                    version: 2,
                    migration: async ({ db, transaction }) => {
                        const newStore = db.createObjectStore(
                            'new_metadata_store_with_old_data',
                            { keyPath: 'key' }
                        )
                        const metadataStore =
                            transaction.objectStore('metadata')
                        const all = await metadataStore.getAll<
                            { key: string; value: string },
                            string
                        >()
                        for (const { key, value } of all) {
                            await newStore.add({ key, value })
                        }
                        db.deleteObjectStore('metadata')
                    },
                },
            ])

            const existingStores = db.objectStoreNames
            const dataSizeInNewMetadataSore = await db
                .transaction('new_metadata_store_with_old_data')
                .objectStore('new_metadata_store_with_old_data')
                .count()

            return {
                existingStores,
                dataSizeInNewMetadataSore: dataSizeInNewMetadataSore,
            }
        }

        const data = await performInWebBrowserContext<unknown>(page, toPerform)

        expect(data).toEqual({
            existingStores: ['new_metadata_store_with_old_data'],
            dataSizeIneNewMetadataSore: 10,
        })
    })
})
