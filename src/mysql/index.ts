// https://github.com/sidorares/node-mysql2
import type { TObject } from '@sinclair/typebox';
import type { DB_TYPE } from '../base/types';
import type { PoolOptions, FieldPacket } from 'mysql2/promise'

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

const MY: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }



export class View<T extends TObject> extends BaseView<T, Pool> {
    protected _DB_TYPE: DB_TYPE = 'mysql';
    protected _BUILDER: SqlBuilder = MY;
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

    /**
     * same arguments as mysql.query()
     * */
    exec(...args: any[]): Promise<[any, FieldPacket[]]> {
        return this.getClient().query.call(this.getClient(), ...args);
    }
}

export class Table<T extends TObject> extends BaseTable<T, Pool> {
    protected _DB_TYPE: DB_TYPE = 'mysql';
    protected _BUILDER: SqlBuilder = MY;
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


    /**
     * same arguments as mysql.query()
     * */
    exec(...args: any[]): Promise<[any, FieldPacket[]]> {
        return this.getClient().query.call(this.getClient(), ...args);
    }
}

export type MYSettings = Omit<Settings, 'provider'> & {
    provider: PoolOptions | (() => Pool)
};

export const setup = (settings: MYSettings, cb?: (err: Error) => void): Pool => {
    let pool: Pool;
    if (_.isFunction(settings.provider)) {
        pool = settings.provider();
    } else {
        pool = createPool(settings.provider);
    }
    _setup({ ...settings, provider: ['mysql', () => pool], })
    return pool;
}