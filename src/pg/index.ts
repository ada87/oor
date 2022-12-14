import _ from 'lodash';
import type { TObject } from '@sinclair/typebox';
import type { DB_TYPE } from '../base/types';

import { ClientBase, Pool, PoolConfig, QueryResult } from 'pg';
import { Settings, setup as _setup } from '../base/Util'
import { SqlBuilder, SqlExecutor } from '../base/sql';
import { getFieldType } from '../base/QueryBuilder';
import { BaseView, TableOptions } from '../base/BaseView';
import { BaseTable } from '../base/BaseTable';

import { insert, update, del, select, count, byField, orderBy, limit } from './basic/builder';
import { where, fixWhere } from './basic/where'
import { executor } from './basic/executor'

// Export Some useful global apis/types.
export { UType } from '../base/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
export type { Static } from '@sinclair/typebox';

const PG: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }


type Connection = ClientBase | Pool;

export class View<T extends TObject> extends BaseView<T, Connection> {
    protected _DB_TYPE: DB_TYPE = 'pg';
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;

    constructor(tableName: string, schema: T, options?: TableOptions) {
        super(tableName, schema, options);
        const WHERE = [];
        if (this._CONFIG.mark) {
            let column = _.keys(this._CONFIG.mark)[0];
            WHERE.push({ field: column, value: this._CONFIG.mark[column], condition: '!=' });
        }
        if (options && options.globalCondition && options.globalCondition.length) {
            options.globalCondition.map(item => {
                let schema = this._CONFIG.FIELD_MAP.get(this._C2F.get(item.column))
                if (schema) {
                    WHERE.push({ ...item, type: getFieldType(schema) })
                } else {
                    console.error(item)
                }
            })
        }
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, WHERE)
    }

    sql(...args: any[]): Promise<QueryResult<T>> {
        return super.sql(...args);
    }
}

export class Table<T extends TObject> extends BaseTable<T, Connection> {
    protected _DB_TYPE: DB_TYPE = 'pg';
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;
    constructor(tableName: string, schema: T, options?: TableOptions) {
        super(tableName, schema, options);
        const WHERE = [];
        if (this._CONFIG.mark) {
            let column = _.keys(this._CONFIG.mark)[0];
            WHERE.push({ field: column, value: this._CONFIG.mark[column], condition: '!=' });
        }
        if (options && options.globalCondition && options.globalCondition.length) {
            options.globalCondition.map(item => {
                let schema = this._CONFIG.FIELD_MAP.get(this._C2F.get(item.column))
                if (schema) {
                    WHERE.push({ ...item, type: getFieldType(schema) })
                } else {
                    console.error(item)
                }
            })
        }
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, WHERE)
    }

    sql(...args: any[]): Promise<QueryResult<T>> {
        return super.sql(...args);
    }
}

export type PGSettings = Omit<Settings, 'provider'> & {
    provider: PoolConfig | (() => ClientBase | Pool)
};

export const setup = (settings: PGSettings, cb?: (err: Error) => void): Pool => {
    if (_.isFunction(settings.provider)) {
        _setup({ ...settings, provider: ['pg', settings.provider], })
        return settings.provider() as Pool;
    } else {
        const pool = new Pool(settings.provider);
        pool.connect(cb);
        _setup({ ...settings, provider: ['pg', () => pool], })
        return pool;
    }
}