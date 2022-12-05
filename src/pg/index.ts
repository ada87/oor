import _ from 'lodash';
import { BaseView, TableOptions } from '../base/BaseView';
import { BaseTable } from '../base/BaseTable';
import type { TObject } from '@sinclair/typebox';
import { SqlBuilder, SqlExecutor } from '../base/sql';
import { WhereItem } from '../base/types';
import { Kind } from '@sinclair/typebox';
import { USchema } from '../base/types';
import { where } from './where'
import { insert, update, del, select, count, byField, orderBy, limit } from './basic';


const PG: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

import { executor } from './executor'

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
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;

    constructor(tableName: string, schema: T, options?: TableOptions) {
        super(tableName, schema, options);
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, (options && options.globalCondition) ? options.globalCondition : [])

    }
}

export class Table<T extends TObject> extends BaseTable<T> {
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;
    constructor(tableName: string, schema: T, options?: TableOptions) {
        super(tableName, schema, options);
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, (options && options.globalCondition) ? options.globalCondition : [])
    }
}

export { setup, UType } from '../base/Util';
export * from '../base/types';
export type { Static } from '@sinclair/typebox';