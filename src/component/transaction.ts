import {
    ObjectStoreInterface,
    TransactionInterface,
} from '@/component/interface/components.interface'
import { ObjectStore } from '@/component/object-store'
import { Database } from '@/component/database'

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
        if (this.ctx.transaction.commit === undefined) {
            return
        }

        return new Promise((resolve, reject) => {
            this.ctx.transaction.addEventListener('complete', () => {
                resolve()
            })
            /* istanbul ignore next */
            this.ctx.transaction.addEventListener('error', (event) => {
                const target = event.target as IDBTransaction
                reject(target.error)
            })
            this.ctx.transaction.commit()
        })
    }
    objectStore(name: string): ObjectStoreInterface {
        const objectStore = this.ctx.transaction.objectStore(name)
        return new ObjectStore({ objectStore })
    }

    get objectStoreNames(): string[] {
        return Array.from(this.ctx.transaction.objectStoreNames)
    }

    get db(): Database {
        return new Database({ db: this.ctx.transaction.db })
    }

    /* istanbul ignore next */
    get durability(): IDBTransactionDurability {
        return this.ctx.transaction.durability
    }

    /* istanbul ignore next */
    get error(): DOMException {
        return this.ctx.transaction.error
    }

    get mode(): IDBTransactionMode {
        return this.ctx.transaction.mode
    }
}
