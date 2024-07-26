import { ValueCursorInterface } from '@/component/interface/components.interface'
import { KeyCursor } from '@/component/key-cursor'
import { requestResolver } from '@/shared/request-resolver'

export class ValueCursor<PK extends IDBValidKey, K extends IDBValidKey, R>
    extends KeyCursor<PK, K>
    implements ValueCursorInterface<PK, K, R>
{
    get value(): R | undefined {
        return (this._cursor as IDBCursorWithValue)?.value as R | undefined
    }

    async delete(): Promise<void> {
        await requestResolver<undefined>(this._cursor.delete())
    }

    async update(value: R): Promise<void> {
        await requestResolver<IDBValidKey>(this._cursor.update(value))
    }
}
