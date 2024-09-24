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
})
