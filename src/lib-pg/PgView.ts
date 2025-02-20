import _ from '../core/dash';
import { BaseView, } from '../core/BaseView'
import { PgQuery } from './PgSQL';
import { PG_EXECUTOR, PG_QUERY } from './ExecutorNodePg'

import type { Database, TableOptions, QueryExecutor } from '../core'
// import { getFieldType } from '../base/utils/QueryBuilder';
// import { BaseView, TableOptions } from '../base/BaseView';
// import { insert, update, del, select, count, byField, orderBy, limit } from './basic/builder';
// import { where, fixWhere } from './basic/where'
// import { executor } from './basic/executor'

import type { TObject, Static } from '@sinclair/typebox';


// Export Some useful global apis/types.


// import type { QueryExecutor } from '../base/sql';
// const PG: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

// import { BaseClient } from '../base/Database';

import type { Client, ClientBase, Pool } from 'pg';


export class PgView<C, S extends TObject> extends BaseView<C, S, PgQuery> {
    protected EXECUTOR = PG_QUERY as QueryExecutor<C, any>;


    constructor(db: Database<C>, tableName: string, tableSchema: S, tableOptions?: TableOptions) {
        super(PgQuery, db, tableName, tableSchema, tableOptions);
    }


    // protected _BUILDER: SqlBuilder = PG;
    // protected _EXECUTOR: SqlExecutor<T> = executor;

    /**
     * 1. INIT  _CONFIG.fields_query  AND _CONFIG.fields_get
     * 5. Fix Where Condition (NEED BUILDER?)
    */
    // protected init(schema: T, options?: TableOptions) {
    // let fields_query = [];
    // let fields_get = [];
    // _.keys(schema.properties).map(field => {
    //     let properties = schema.properties[field];
    //     if (properties.column) {
    //         fields_get.push(`"${properties.column}" AS "${field}"`);
    //         if (properties.ignore === true) {
    //             return;
    //         }
    //         fields_query.push(`"${properties.column}" AS "${field}"`);
    //     } else {
    //         fields_get.push('"' + field + '"');
    //         if (properties.ignore === true) {
    //             return;
    //         }
    //         fields_query.push('"' + field + '"');
    //     }
    // });
    // this._CONFIG.fields_query = fields_query.join(',');
    // this._CONFIG.fields_get = fields_get.join(',')
    // const WHERE = [];
    // if (this._CONFIG.mark) {
    //     let column = _.keys(this._CONFIG.mark)[0];
    //     WHERE.push({ field: column, value: this._CONFIG.mark[column], condition: '!=' });
    // }
    // if (options && options.globalCondition && options.globalCondition.length) {
    //     options.globalCondition.map(item => {
    //         let schema = this._CONFIG.COLUMN_MAP.get(this._C2F.get(item.column))
    //         if (schema) {
    //             WHERE.push({ ...item, type: getFieldType(schema) })
    //         } else {
    //             console.error(item)
    //         }
    //     })
    // }
    // this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.COLUMN_MAP, WHERE);
    // }


    /**
     * same arguments as pg.query()
     * */
    sql: ClientBase['query'] = async (...args: any[]) => {
        // this.getClient()
        // const
        const conn = await this.getConn() as ClientBase;

        return conn.query.call(conn, ...args);
    }


}



// import _ from 'lodash';
// import { SUFFIX } from './types'
// import { , } from './index'
// import { UType } from '../base/utils/SQLUtil';

// import type { MagicSuffix, WhereItem, FieldType, Support } from './types';

// // Line 2 : Build a Schema ,
// //          Schema can be used for validate、check, @see @sinclair/typebox
// //          Some FrameWork support this schema derectly , like fastify
// export const UserSchema = UType.Table({
//     id: UType.Integer(),
//     name: UType.String({ maxLength: 32 }),
//     age: UType.Integer({ minimum: 0, maximum: 128 }),
//     sex: UType.Boolean(),
//     profile: UType.String({ ignore: true }),
//     address: UType.String({ maxLength: 128 }),
//     salary: UType.Number(),
//     registerDate: UType.Date({ column: 'register_date', isCreate: true }),
//     lastModify: UType.Date({ column: 'last_modify', isModify: true })
// });

// const a = new PgView(null,null,UserSchema,null);
// const user  = await a.getByCondition()