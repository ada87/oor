import _ from 'lodash';
import { Kind } from '@sinclair/typebox';
import type { TObject } from '@sinclair/typebox';
import type { ClientBase, Pool } from 'pg';

import { USchema, WhereItem, DB_TYPE } from '../base/types';
import { Settings, setup as _setup } from '../base/Util'
import { SqlBuilder, SqlExecutor } from '../base/sql';
import { BaseView, TableOptions } from '../base/BaseView';
import { BaseTable } from '../base/BaseTable';

import { insert, update, del, select, count, byField, orderBy, limit } from './basic';
import { where } from './where'
import { executor } from './executor'

// Export Some useful global apis/types.
export * from '../base/types';
export { UType } from '../base/Util';
export type { Static } from '@sinclair/typebox';



const PG: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

const fixWhere = (FIELD_MAP: Map<string, USchema>, extra: WhereItem[]): [string, string] => {
    let ITEMS: WhereItem[] = [];
    let ctf = new Map<string, string>();
    const convert = (kind, value) => {
        switch (kind) {
            case 'Boolean':
                return value;
            case 'Number':
                return parseFloat(value);
            case 'Integer':
                return parseInt(value);
            default:
                return value + '';
        }
    }
    for (let [key, val] of FIELD_MAP) {
        if (_.has(val, 'delMark')) {
            ITEMS.push({ field: (val.column || key), condition: '<>', value: convert(val[Kind as any], val.delMark) })
        }
        ctf.set((val.column || key), key);
    }
    extra.map(item => {
        let schema = FIELD_MAP.get(item.field) || FIELD_MAP.get(ctf.get(item.field));
        if (schema == null) return;
        ITEMS.push({ ...item, value: convert(schema[Kind as any], item.value) });
    })
    let [SQL, PARAM] = where(ITEMS);
    if (SQL.length == 0) return ['', ' WHERE '];
    PARAM.map((item, i) => {
        SQL = SQL.replaceAll(`$${i + 1}`, _.isNumber(item) ? (item + '') : `'${item}'`)
    });
    return [' WHERE ' + SQL, ' AND ']
}


export class View<T extends TObject> extends BaseView<T> {
    protected _DB_TYPE: DB_TYPE = 'pg';
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;

    constructor(tableName: string, schema: T, options?: TableOptions) {
        super(tableName, schema, options);
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, (options && options.globalCondition) ? options.globalCondition : [])

    }
}

export class Table<T extends TObject> extends BaseTable<T> {
    protected _DB_TYPE: DB_TYPE = 'pg';
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;
    constructor(tableName: string, schema: T, options?: TableOptions) {
        super(tableName, schema, options);
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, (options && options.globalCondition) ? options.globalCondition : [])
    }
}

export type PGSettings = Omit<Settings, 'provider'> & {
    provider: () => ClientBase | Pool
};

export const setup = (settings: PGSettings) => _setup({ ...settings, provider: ['pg', settings.provider], })
