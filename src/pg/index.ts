import _ from 'lodash';

import { ClientBase, Pool, PoolConfig, QueryResult } from 'pg';
import { Settings, setup as _setup } from '../base/Provider/Util'
import { SqlBuilder, SqlExecutor } from '../base/sql';
import { getFieldType } from '../base/QueryBuilder';
import { BaseView, TableOptions } from '../base/BaseView';
import { BaseTable } from '../base/BaseTable';
import { insert, update, del, select, count, byField, orderBy, limit } from './basic/builder';
import { where, fixWhere } from './basic/where'
import { executor } from './basic/executor'

import type { DB_TYPE } from '../base/types';
import type { Static, TObject } from '@sinclair/typebox';

// Export Some useful global apis/types.
export { UType } from '../base/Provider/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';

export type { Static } from '@sinclair/typebox';

const PG: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }


type Connection = ClientBase | Pool;

export class View<T extends TObject> extends BaseView<T, Connection> {
    protected _DB_TYPE: DB_TYPE = 'pg';
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<T> = executor;

    /**
     * 1. INIT  _CONFIG.fields_query  AND _CONFIG.fields_get
     * 5. Fix Where Condition (NEED BUILDER?)
    */
    protected init(schema: T, options?: TableOptions) {
        let fields_query = [];
        let fields_get = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            if (properties.column) {
                fields_get.push(`"${properties.column}" AS "${field}"`);
                if (properties.ignore === true) {
                    return;
                }
                fields_query.push(`"${properties.column}" AS "${field}"`);
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
     * same arguments as pg.query()
     * */
    sql: ClientBase['query'] = (...args: any[]) => {
        return this.getClient().query.call(this.getClient(), ...args);
    }
}

export class Table<T extends TObject> extends BaseTable<T, Connection>{
    protected _DB_TYPE: DB_TYPE = 'pg';
    protected _BUILDER: SqlBuilder = PG;
    protected _EXECUTOR: SqlExecutor<Static<T>> = executor;

    protected init(schema: T, options?: TableOptions) {
        let fields_query = [];
        let fields_get = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            if (properties.column) {
                fields_get.push(`"${properties.column}" AS "${field}"`);
                if (properties.ignore === true) {
                    return;
                }
                fields_query.push(`"${properties.column}" AS "${field}"`);
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
     * same arguments as pg.query()
     * */
    sql: ClientBase['query'] = (...args: any[]) => {
        return this.getClient().query.call(this.getClient(), ...args);
    }
}

export type PGSettings = Omit<Settings, 'provider'> & {
    provider: PoolConfig | (() => ClientBase | Pool)
};

export const setup = async (settings: PGSettings): Promise<Pool> => {
    let pool: Pool;
    if (_.isFunction(settings.provider)) {
        pool = settings.provider() as Pool;
    } else {
        pool = new Pool(settings.provider);
        await pool.connect();
    }
    _setup({ ...settings, provider: ['pg', () => pool], })
    return pool;
}