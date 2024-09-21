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

declare let self: Window | undefined

/* istanbul ignore next */
if (typeof self !== 'undefined') {
    self.DatabaseFactory = DatabaseFactory
}
