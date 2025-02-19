// import _ from 'lodash';
import { ActionExecutor, QueryBuilder, QueryExecutor } from '../core';
// import { getFieldType } from '../core/utils/QueryBuilder';
import { PgActionBuilder } from './PgQueryBuilder'
import { PG_EXECUTOR } from './PgExecutor'
import { BaseTable } from '../core/BaseTable';

import type { Static, TObject } from '@sinclair/typebox';




import type { ClientBase, } from 'pg';
import { PgView } from './PgView'


export class PgTable<C, S extends TObject> extends PgView<C, S, PgActionBuilder> {

    protected EXECUTOR = PG_EXECUTOR as ActionExecutor<C, any>;


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
        const conn = await this.getConn() as ClientBase;
        return conn.query.call(conn, ...args);
        // return this.getClient().query.call(this.getClient(), ...args);
    }
}