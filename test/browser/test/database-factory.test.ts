import type { DatabaseFactory as DF } from '../../../src'
import {
    executeInBrowser,
    type ToExecuteInBrowser,
} from '../../test-helpers/web-browser-context'
import { test, expect } from '@playwright/test'

declare const DatabaseFactory: typeof DF

test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
        console.log(msg.text())
    })
})

test.describe('browser environment', () => {
    test('can create a database and record into it', async ({ page }) => {
        const toExecute: ToExecuteInBrowser<[number], number> = async ([
            quantity,
        ]) => {
            const db = await DatabaseFactory.open('test', 1, [
                {
                    version: 1,
                    migration: async ({ db }) => {
                        const store = db.createObjectStore('metadata', {
                            keyPath: 'key',
                        })
                        let i = 0
                        while (i++ < quantity) {
                            await store.add({ key: i, value: i })
                        }
                    },
                },
            ])

            const data = await db
                .transaction('metadata')
                .objectStore('metadata')
                .count()

            db.close()

            return data
        }

        const quantity = 1000
        const recordSize = await executeInBrowser(page, toExecute, [
            quantity,
        ] as [number])

        expect(recordSize).toBe(quantity)
    })

    test('async migration copy with get all from previous store', async ({
        page,
    }) => {
        type ToExecuteReturn = {
            existingStores: string[]
            dataSizeInNewMetadataSore: number
        }

        const toExecute: ToExecuteInBrowser<
            [number],
            ToExecuteReturn
        > = async ([quantity]) => {
            const name = Math.random().toString(36).substring(3)
            const version = 1

            let db = await DatabaseFactory.open(name, version, [
                {
                    version: 1,
                    migration: async ({ db }) => {
                        db.createObjectStore('metadata', { keyPath: 'key' })
                    },
                },
            ])

            const transaction = db.transaction('metadata', 'readwrite')

            for (let i = 0; i < quantity; i++) {
                await transaction
                    .objectStore('metadata')
                    .add({ key: i, value: i })
            }

            await transaction.commit()
            db.close()

            db = await DatabaseFactory.open(name, version + 1, [
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

            const toReturn = {
                existingStores,
                dataSizeInNewMetadataSore: dataSizeInNewMetadataSore,
            }

            db.close()

            return toReturn
        }

        const quantity = 1000
        const data = await executeInBrowser(page, toExecute, [quantity] as [
            number,
        ])

        expect(data).toEqual({
            existingStores: ['new_metadata_store_with_old_data'],
            dataSizeInNewMetadataSore: quantity,
        })
    })

    test('async migration copy with cursor from previous store', async ({
        page,
    }) => {
        type ToExecuteReturn = {
            existingStores: string[]
            dataSizeInNewMetadataSore: number
        }

        const toExecute: ToExecuteInBrowser<
            [number],
            ToExecuteReturn
        > = async ([quantity]) => {
            const name = Math.random().toString(36).substring(3)
            const version = 1

            let db = await DatabaseFactory.open(name, version, [
                {
                    version: 1,
                    migration: async ({ db }) => {
                        db.createObjectStore('metadata', { keyPath: 'key' })
                    },
                },
            ])

            const transaction = db.transaction('metadata', 'readwrite')

            for (let i = 0; i < quantity; i++) {
                await transaction
                    .objectStore('metadata')
                    .add({ key: i, value: i })
            }

            await transaction.commit()
            db.close()

            db = await DatabaseFactory.open(name, version + 1, [
                {
                    version: 2,
                    migration: async ({ db, transaction }) => {
                        const newStore = db.createObjectStore(
                            'new_metadata_store_with_old_data',
                            { keyPath: 'key' }
                        )
                        const metadataStore =
                            transaction.objectStore('metadata')
                        const cursor = metadataStore.openCursor<
                            string,
                            string,
                            { key: string; value: string }
                        >()
                        while (!(await cursor.end())) {
                            const { key, value } = cursor.value
                            await newStore.add({ key, value })
                            cursor.continue()
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

            const toReturn = {
                existingStores,
                dataSizeInNewMetadataSore: dataSizeInNewMetadataSore,
            }

            db.close()

            return toReturn
        }

        const quantity = 1000
        const data = await executeInBrowser(page, toExecute, [quantity] as [
            number,
        ])

        expect(data).toEqual({
            existingStores: ['new_metadata_store_with_old_data'],
            dataSizeInNewMetadataSore: quantity,
        })
    })

    test('data comme from outside fetch inside', async ({
        page,
    }) => {
        type ToExecuteReturn = {
            existingStores: string[]
            metadataSize: number
        }

        const toExecute: ToExecuteInBrowser<
            undefined,
            ToExecuteReturn
        > = async () => {
            const name = Math.random().toString(36).substring(3)
            const version = 1

            const db = await DatabaseFactory.open(name, version, [
                {
                    version: 1,
                    migration: async ({ db }) => {
                        db.createObjectStore('metadata', { keyPath: 'key' })
                    },
                },
            ])

            await fetch('https://jsonplaceholder.typicode.com/todos/3').then(async response => {
                const responseJson = await response.json()
                const transaction = db.transaction('metadata', 'readwrite')
                const objectStore = transaction.objectStore('metadata')
                await objectStore.add({ key: 1, value: responseJson })
                await transaction.commit()
            })

            const existingStores = db.objectStoreNames
            const dataSize = await db
                .transaction('metadata')
                .objectStore('metadata')
                .count()

            const toReturn = {
                existingStores,
                metadataSize: dataSize,
            }

            db.close()

            return toReturn
        }

        const data = await executeInBrowser(page, toExecute).catch((error) => {
            console.error(error)
        })

        expect(data).toEqual({
            existingStores: ['metadata'],
            metadataSize: 1,
        })
    })
})
