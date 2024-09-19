import type {
    DatabaseInterface,
    ObjectStoreInterface,
    TransactionInterface,
} from '@/component/interface/components.interface'
import { ObjectStore } from '@/component/object-store'
import { Transaction } from '@/component/transaction'

export class Database implements DatabaseInterface {
    constructor(private readonly ctx: { db: IDBDatabase }) {}

    close(): void {
        this.ctx.db.close()
    }

    createObjectStore(
        name: string,
        options?: IDBObjectStoreParameters
    ): ObjectStoreInterface {
        const objectStore = this.ctx.db.createObjectStore(name, options)
        return new ObjectStore({ objectStore })
    }

    deleteObjectStore(name: string): void {
        return this.ctx.db.deleteObjectStore(name)
    }

    transaction(
        storeNames: string | string[],
        mode?: IDBTransactionMode,
        options?: IDBTransactionOptions
    ): TransactionInterface {
        const transaction = this.ctx.db.transaction(storeNames, mode, options)
        return new Transaction({ transaction })
    }

    get objectStoreNames(): string[] {
        return Array.from(this.ctx.db.objectStoreNames)
    }
}
