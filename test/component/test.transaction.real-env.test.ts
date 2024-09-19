import type {DatabaseFactory as DF} from "../../src";
import type {Page} from "playwright";

declare let page: Page
declare let DatabaseFactory: typeof DF

describe('testing in real environment', () => {
    it('test WO long process between', async () => {
        let error = undefined
        await page.goto('file://' + __dirname + '/../empty.html')
        const data = await (page.evaluate<[]>(async () => {
            return new Promise<[]>((resolve, reject) => {
                DatabaseFactory.open('test_01', 1, [{
                    version: 1,
                    upgrade: async ({db, transaction}) => {
                        db.createObjectStore('store_01', {keyPath: 'id'})
                    }
                }])
                    .then(async (db) => {
                        const tx = db.transaction('store_01', 'readwrite')
                        await tx.objectStore('store_01').put({id: 1, name: 'test'})

                        return tx
                    })
                    .then(async (tx) => {
                        await tx.objectStore('store_01').put({id: 2, name: 'test'})
                        return tx
                    })
                    .then(async (tx) => {
                        await tx.objectStore('store_01').put({id: 3, name: 'test'})
                        return tx.db
                    })
                    .then(async (db) => {
                        const data = await db.transaction('store_01').objectStore('store_01').getAll() as []

                        resolve(data)
                    })
                    .catch(reason => {
                        reject(reason)
                    })
            })
        }).catch(reason => {
            error = reason
        }) as Promise<[]>)

        expect(error).toBeUndefined()
        expect(data.length).toBe(3)
    })
    it('test WITH long process between then', async () => {
        let error = undefined
        await page.goto('file://' + __dirname + '/../empty.html')
        const data = await (page.evaluate<[]>(async () => {
            return new Promise<[]>((resolve, reject) => {
                DatabaseFactory.open('test_01', 1, [{
                    version: 1,
                    upgrade: async ({db, transaction}) => {
                        db.createObjectStore('store_01', {keyPath: 'id'})
                    }
                }])
                    .then(async (db) => {
                        const tx = db.transaction('store_01', 'readwrite')
                        await tx.objectStore('store_01').put({id: 1, name: 'test'})

                        return tx
                    })
                    .then(async (tx) => {
                        await tx.objectStore('store_01').put({id: 2, name: 'test'})
                        return tx
                    })
                    .then(async (tx) => {
                        await new Promise((resolve, reject) => {
                            setTimeout(() => {
                                resolve(true)
                            }, 1000)
                        }) // producing a delay to try to force an implicit commit
                        return tx
                    })
                    .then(async (tx) => {
                        await tx.objectStore('store_01').put({id: 3, name: 'test'})
                        return tx.db
                    })
                    .then(async (db) => {
                        const data = await db.transaction('store_01').objectStore('store_01').getAll() as []

                        resolve(data)
                    })
                    .catch(reason => {
                        reject(reason)
                    })
            })
        }).catch(reason => {
            error = reason
        }) as Promise<[]>)

        expect(error).toBeUndefined()
        expect(data.length).toBe(3)
    })
})
