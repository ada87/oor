// import _ from 'lodash';
import { ActionExecutor, QueryBuilder, QueryExecutor } from '../base/sql';
import { getFieldType } from '../base/utils/QueryBuilder';
import { PgActionBuilder } from './PgQueryBuilder'
import { PG_EXECUTOR } from './PgExecutor'
import { BaseTable } from '../base/BaseTable';
// import { insert, update, del, select, count, byField, orderBy, limit } from './builder';
// import { where, fixWhere } from './where'
// import { executor } from './executor'

// import type { TableOptions } from '../base';
import type { Static, TObject } from '@sinclair/typebox';

// Export Some useful global apis/types.
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';

export type { Static } from '@sinclair/typebox';

// const PG: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

import type { ClientBase, Pool, } from 'pg';
import { PgView } from './PgView'


export class PgTable<S extends TObject> extends PgView<S, PgActionBuilder> {

    protected EXECUTOR = PG_EXECUTOR as ActionExecutor<Pool, any>;


    // protected init(schema: T, options?: TableOptions) {
    //     let fields_query = [];
    //     let fields_get = [];

    //     Object.keys(schema.properties).map(field => {
    //         let properties = schema.properties[field];
    //         if (properties.column) {
    //             fields_get.push(`"${properties.column}" AS "${field}"`);
    //             if (properties.ignore === true) {
    //                 return;
    //             }
    //             fields_query.push(`"${properties.column}" AS "${field}"`);
    //         } else {
    //             fields_get.push('"' + field + '"');
    //             if (properties.ignore === true) {
    //                 return;
    //             }
    //             fields_query.push('"' + field + '"');
    //         }
    //     });
    //     this._CONFIG.fields_query = fields_query.join(',');
    //     this._CONFIG.fields_get = fields_get.join(',')
    //     const WHERE = [];
    //     if (this._CONFIG.mark) {
    //         let column = Object.keys(this._CONFIG.mark)[0];
    //         WHERE.push({ field: column, value: this._CONFIG.mark[column], condition: '!=' });
    //     }
    //     if (options && options.globalCondition && options.globalCondition.length) {
    //         options.globalCondition.map(item => {
    //             let schema = this._CONFIG.COLUMN_MAP.get(this._C2F.get(item.column))
    //             if (schema) {
    //                 WHERE.push({ ...item, type: getFieldType(schema) })
    //             } else {
    //                 console.error(item)
    //             }
    //         })
    //     }
    //     this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.COLUMN_MAP, WHERE);
    // }

    /**
     * same arguments as pg.query()
     * */
    sql: ClientBase['query'] = async (...args: any[]) => {
        const conn = await this.getConn();
        return conn.query.call(conn, ...args);
        // return this.getClient().query.call(this.getClient(), ...args);
    }
}