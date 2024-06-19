import {
    ObjectStoreInterface,
    TransactionInterface,
} from '@/component/interface/components.interface'
import { ObjectStore } from '@/component/object-store'

export class Transaction implements TransactionInterface {
    constructor(private readonly ctx: { transaction: IDBTransaction }) {}

    abort(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ctx.transaction.addEventListener('abort', () => {
                resolve()
            })
            /* istanbul ignore next */
            this.ctx.transaction.addEventListener('error', (event) => {
                const target = event.target as IDBTransaction
                reject(target.error)
            })
            this.ctx.transaction.abort()
        })
    }
    commit(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ctx.transaction.addEventListener('complete', () => {
                resolve()
            })
            /* istanbul ignore next */
            this.ctx.transaction.addEventListener('error', (event) => {
                const target = event.target as IDBTransaction
                reject(target.error)
            })
        })
    }
    objectStore(name: string): ObjectStoreInterface {
        const objectStore = this.ctx.transaction.objectStore(name)
        return new ObjectStore({ objectStore })
    }
}
