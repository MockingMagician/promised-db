import {
    IndexInterface,
    KeyCursorInterface,
    ObjectStoreInterface,
} from '@/component/interface/components.interface'
import { requestResolver } from '@/shared/request-resolver'

export class KeyCursor<PK extends IDBValidKey, K extends IDBValidKey, R>
    implements KeyCursorInterface<PK, K, R>
{
    protected _cursor: IDBCursor | null
    protected _cursorPromise: Promise<IDBCursor | null>

    constructor(
        private readonly ctx: {
            request: IDBRequest<IDBCursor | null>
            direction: IDBCursorDirection
            source: ObjectStoreInterface | IndexInterface
        }
    ) {
        this._cursorPromise = requestResolver<IDBCursor | null>(
            ctx.request
        ).then((cursor) => {
            this._cursor = cursor
            return cursor
        })
    }

    get key(): K {
        return this._cursor?.key as K | undefined
    }

    get primaryKey(): PK | undefined {
        return this._cursor?.primaryKey as PK | undefined
    }

    get direction(): IDBCursorDirection {
        return this.ctx.direction
    }

    get source(): ObjectStoreInterface | IndexInterface {
        return this.ctx.source
    }

    async end(): Promise<boolean> {
        return this._cursorPromise.then((cursor) => !cursor)
    }

    continue(key?: K | PK): void {
        this.stepUp()?.continue(key)
    }

    advance(count: number): void {
        this.stepUp()?.advance(count)
    }

    continuePrimaryKey(key: K, primaryKey: PK): void {
        this.stepUp()?.continuePrimaryKey(key, primaryKey)
    }

    private stepUp(): IDBCursor | null {
        this._cursorPromise = requestResolver<IDBCursor | null>(
            this.ctx.request
        ).then((cursor) => {
            this._cursor = cursor
            return cursor
        })
        const cursor = this._cursor
        this._cursor = null
        return cursor
    }
}
