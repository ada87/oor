// https://github.com/sidorares/node-mysql2
import type { TObject } from '@sinclair/typebox';
import type { DB_TYPE } from '../base/types';
import type { PoolOptions } from 'mysql2/promise'

import _ from 'lodash';
import { createPool, Pool } from 'mysql2/promise';
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



export class View<T extends TObject> extends BaseView<T, Pool> {
    protected _DB_TYPE: DB_TYPE = 'mysql';
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;

    protected init(schema: T, options?: TableOptions) {
        let fields_query = [];
        let fields_get = [];

        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            if (properties.column) {
                fields_get.push(`\`${properties.column}\` AS \`${field}\``);
                if (properties.ignore === true) {
                    return;
                }
                fields_query.push(`\`${properties.column}\` AS \`${field}\``);
            } else {
                fields_get.push('`' + field + '`');
                if (properties.ignore === true) {
                    return;
                }
                fields_query.push('`' + field + '`');
            }
        });
        this._CONFIG.fields_query = fields_query.join(',');
        this._CONFIG.fields_get = fields_get.join(',')
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
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, WHERE);
    }


    // sql(...args: any[]): Promise<QueryResult<T>> {
    //     return super.sql(...args);
    // }
}

export class Table<T extends TObject> extends BaseTable<T, Pool> {
    protected _DB_TYPE: DB_TYPE = 'mysql';
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;
    protected init(schema: T, options?: TableOptions) {
        let fields_query = [];
        let fields_get = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            if (properties.column) {
                fields_get.push(`\`${properties.column}\` AS \`${field}\``);
                if (properties.ignore === true) {
                    return;
                }
                fields_query.push(`\`${properties.column}\` AS \`${field}\``);
            } else {
                fields_get.push('"' + field + '"');
                if (properties.ignore === true) {
                    return;
                }
                fields_query.push('"' + field + '"');
            }
        });
        this._CONFIG.fields_query = fields_query.join(',');
        this._CONFIG.fields_get = fields_get.join(',')
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
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.FIELD_MAP, WHERE);
    }



    // sql(...args: any[]): Promise<QueryResult<T>> {
    //     return super.sql(...args);
    // }
}

export type PGSettings = Omit<Settings, 'provider'> & {
    provider: PoolOptions | (() => Pool)
};

export const setup = (settings: PGSettings, cb?: (err: Error) => void): Pool => {
    if (_.isFunction(settings.provider)) {
        _setup({ ...settings, provider: ['mysql', settings.provider], })
        return settings.provider() as Pool;
    } else {
        const pool = createPool(settings.provider);
        _setup({ ...settings, provider: ['mysql', () => pool], })
        // cb();
        return pool;
    }
}