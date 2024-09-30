import { DatabaseFactory } from '@/database-factory'
export * from '@/component/database'
export * from '@/component/interface/components.interface'
export * from '@/component/key-cursor'
export * from '@/component/object-store'
export * from '@/component/store-index'
export * from '@/component/transaction'
export * from '@/component/value-cursor'
export * from '@/database-factory'
declare interface Window {
    DatabaseFactory: typeof DatabaseFactory
}
declare interface Worker {
    DatabaseFactory: typeof DatabaseFactory
}

declare let globalThis: Window | Worker

/* istanbul ignore next */
if (typeof globalThis !== 'undefined') {
    globalThis.DatabaseFactory = DatabaseFactory
}
