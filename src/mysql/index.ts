// https://github.com/sidorares/node-mysql2
import _ from 'lodash';
import { createPool } from 'mysql2/promise';
import { Settings, setup as _setup } from '../base/Util'
import { getFieldType } from '../base/QueryBuilder';
import { BaseView } from '../base/BaseView';
import { BaseTable } from '../base/BaseTable';

import { insert, update, del, select, count, byField, orderBy, limit } from './basic/builder';
import { where, fixWhere } from './basic/where'
import { executor } from './basic/executor'


import type { Static, TObject } from '@sinclair/typebox';
import type { DB_TYPE } from '../base/types';
import type { PoolOptions, FieldPacket, Pool } from 'mysql2/promise'
import type { SqlBuilder, SqlExecutor } from '../base/sql';
import type { TableOptions } from '../base/BaseView';


export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
/**
 * A Quick Ref
*/
export { UType } from '../base/Util';
export type { Static } from '@sinclair/typebox';


const MYSQL: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

const SelectField = (field: string, schema: any) => {
    const type = getFieldType(schema)
    if (type == 'boolean') {
        if (schema.column) return `IF(\`${schema.column}\`= 1, TRUE, FALSE) AS \`${field}\``;
        return `IF(\`${field}\`= 1, TRUE, FALSE) AS \`${field}\``;
    }
    if (schema.column) return `\`${schema.column}\` AS \`${field}\``;
    return '`' + field + '`';
}

/**
 * View Object is use for data_table(query only) / data_view
 * Want update/delete/add ? use @see Table
*/
export class View<T extends TObject> extends BaseView<T, Pool> {
    protected _DB_TYPE: DB_TYPE = 'mysql';
    protected _BUILDER: SqlBuilder = MYSQL;
    protected _EXECUTOR: SqlExecutor<T> = executor;

    protected init(schema: T, options?: TableOptions) {
        let fields_query = [];
        let fields_get = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            let select = SelectField(field, properties);
            fields_get.push(select);
            if (properties.ignore === true) return;
            fields_query.push(select);
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
                let schema = this._CONFIG.COLUMN_MAP.get(this._C2F.get(item.column))
                if (schema) {
                    WHERE.push({ ...item, type: getFieldType(schema) })
                } else {
                    console.error(item)
                }
            })
        }
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.COLUMN_MAP, WHERE);
    }

    /**
     * same arguments as mysql.query()
     * */
    sql: Pool['query'] = (...args: any[]) => {
        return this.getClient().query.call(this.getClient(), ...args);
    }

}
/**
 * Table Object is use for data_table.
 * Provide CRUD method to manager table records.
*/
export class Table<T extends TObject> extends BaseTable<T, Pool> {
    protected _DB_TYPE: DB_TYPE = 'mysql';
    protected _BUILDER: SqlBuilder = MYSQL;
    protected _EXECUTOR: SqlExecutor<Static<T>> = executor;
    protected init(schema: T, options?: TableOptions) {
        let fields_query = [];
        let fields_get = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            let select = SelectField(field, properties);
            fields_get.push(select);
            if (properties.ignore === true) return;
            fields_query.push(select);
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
                let schema = this._CONFIG.COLUMN_MAP.get(this._C2F.get(item.column))
                if (schema) {
                    WHERE.push({ ...item, type: getFieldType(schema) })
                } else {
                    console.error(item)
                }
            })
        }
        this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.COLUMN_MAP, WHERE);
    }

    async add(object: Static<T>): Promise<Static<T>> {
        const result = await super.add(object)
        return await this.getById(result['id'] as string)
    }

    /**
      * same arguments as mysql.query()
      * */
    sql: Pool['query'] = (...args: any[]) => {
        return this.getClient().query.call(this.getClient(), ...args);
    }
}

export type MySqlSettings = Omit<Settings, 'provider'> & {
    provider: PoolOptions | (() => Pool)
};

export const setup = async (settings: MySqlSettings): Promise<Pool> => {
    let pool: Pool;
    if (_.isFunction(settings.provider)) {
        pool = settings.provider();
    } else {
        pool = createPool(settings.provider);
    }
    _setup({ ...settings, provider: ['mysql', () => pool], })
    return pool;
}