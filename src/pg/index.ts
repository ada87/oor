import { BaseView } from '../base/BaseView';
import { BaseTable } from '../base/BaseTable';
import type { TObject } from '@sinclair/typebox';
import { SqlBuilder, SqlExecutor } from '../base/sql';
import { PG, executor } from './sql'

export class View<T extends TObject> extends BaseView<T> {
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;
}

export class Table<T extends TObject> extends BaseTable<T> {
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;
}

export { setup, UType } from '../base/Util';
export * from '../base/types';
export type { Static } from '@sinclair/typebox';