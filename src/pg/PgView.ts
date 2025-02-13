import _ from 'lodash';

import { SqlBuilder, SqlExecutor } from '../base/sql';
import { getFieldType } from '../base/QueryBuilder';
import { BaseView, TableOptions } from '../base/BaseView';
import { insert, update, del, select, count, byField, orderBy, limit } from './basic/builder';
import { where, fixWhere } from './basic/where'
import { executor } from './basic/executor'

import type { Static, TObject } from '@sinclair/typebox';

// Export Some useful global apis/types.
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';

export type { Static } from '@sinclair/typebox';

const PG: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

// import { BaseClient } from '../base/Database';

import type { Client, ClientBase, Pool } from 'pg';


export class PgView<T extends TObject> extends BaseView<T, Client | Pool> {


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
        // const client =await this.getClient();
        // client.query(`CREATE OR REPLACE VIEW ${this._CONFIG.name} AS SELECT ${this._CONFIG.fields_query} FROM ${this._CONFIG.table}`);
    }


    /**
     * same arguments as pg.query()
     * */
    sql: ClientBase['query'] = async (...args: any[]) => {
        // this.getClient()
        // const
        const conn = await this.getConn();

        return conn.query.call(conn, ...args);
    }
}