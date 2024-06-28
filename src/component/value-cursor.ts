import { ValueCursorInterface } from '@/component/interface/components.interface'
import { KeyCursor } from '@/component/key-cursor'

export class ValueCursor<PK extends IDBValidKey, K extends IDBValidKey, R>
    extends KeyCursor<PK, K, R>
    implements ValueCursorInterface<PK, K, R>
{
    get value(): R | undefined {
        return (this._cursor as IDBCursorWithValue)?.value as R | undefined
    }
}
