import { BaseView as _BaseView } from '../base/BaseView';
import { BaseTable as _BaseTable } from '../base/BaseTable';
import type { TObject } from '@sinclair/typebox';
import { SqlCrud, SqlExecuter } from '../base/sql';
import { PG, executor } from './sql'

export class BaseView<T extends TObject> extends _BaseView<T> {
    protected _sql: SqlCrud = PG;
    protected _exec: SqlExecuter = executor;

}

export class BaseTable<T extends TObject> extends _BaseTable<T> {
    protected _sql: SqlCrud = PG;
    protected _exec: SqlExecuter = executor;
}