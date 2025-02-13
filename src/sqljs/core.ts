// import _ from 'lodash';
// import { insert, update, del, select, count, byField, orderBy, limit } from '../sqlite/basic/builder';
// import { where, fixWhere } from '../mysql/basic/where'
// import { executor } from './basic/executor'
// import { getFieldType } from '../base/QueryBuilder';
// import { BaseView } from '../base/BaseView';
// import { BaseTable } from '../base/BaseTable';
// import { Settings, setup as _setup } from '../base/Provider/Util'
// // Export Some useful global apis/types.
// // import { _query } from './basic/toPromise'
// // import initSqlJs from 'sql.js'; 

// import type { Static, TObject } from '@sinclair/typebox';
// import type { SqlBuilder, SqlExecutor } from '../base/sql';
// import type { TableOptions } from '../base/BaseView';
// import type { Database } from 'sql.js';



// const SQLITE: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

// const SelectField = (field: string, schema: any) => {
//     const type = getFieldType(schema)
//     if (type == 'boolean') {
//         if (schema.column) return `IF(\`${schema.column}\`= 1, TRUE, FALSE) AS \`${field}\``;
//         return `IF(\`${field}\`= 1, TRUE, FALSE) AS \`${field}\``;
//     }
//     if (schema.column) return `\`${schema.column}\` AS \`${field}\``;
//     return '`' + field + '`';
// }


// export class View<T extends TObject> extends BaseView<T, Database> {
//     protected _BUILDER: SqlBuilder = SQLITE;
//     protected _EXECUTOR: SqlExecutor<T> = executor;

//     protected init(schema: T, options?: TableOptions) {
//         let fields_query = [];
//         let fields_get = [];
//         _.keys(schema.properties).map(field => {
//             let properties = schema.properties[field];
//             let select = SelectField(field, properties);
//             fields_get.push(select);
//             if (properties.ignore === true) return;
//             fields_query.push(select);
//         });
//         this._CONFIG.fields_query = fields_query.join(',');
//         this._CONFIG.fields_get = fields_get.join(',')
//         const WHERE = [];
//         if (this._CONFIG.mark) {
//             let column = _.keys(this._CONFIG.mark)[0];
//             WHERE.push({ field: column, value: this._CONFIG.mark[column], condition: '!=' });
//         }
//         if (options && options.globalCondition && options.globalCondition.length) {
//             options.globalCondition.map(item => {
//                 let schema = this._CONFIG.COLUMN_MAP.get(this._C2F.get(item.column))
//                 if (schema) {
//                     WHERE.push({ ...item, type: getFieldType(schema) })
//                 } else {
//                     console.error(item)
//                 }
//             })
//         }
//         this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.COLUMN_MAP, WHERE);
//     }

//     /**
//      * same arguments as sqljs.query()
//      * */
//     sqlQuery(sql, ...args: any[]): Promise<T[]> {
//         return this._EXECUTOR.query(this.getClient(), sql, args);
//     }
//     sqlRun(sql, ...args: any[]): Promise<number> {
//         return this._EXECUTOR.execute(this.getClient(), sql, args);
//     }
// }

// export class Table<T extends TObject> extends BaseTable<T, Database> {
//     protected _DB_TYPE: DB_TYPE = 'sqlite';
//     protected _BUILDER: SqlBuilder = SQLITE;
//     protected _EXECUTOR: SqlExecutor<Static<T>> = executor;
//     protected init(schema: T, options?: TableOptions) {
//         let fields_query = [];
//         let fields_get = [];
//         _.keys(schema.properties).map(field => {
//             let properties = schema.properties[field];
//             let select = SelectField(field, properties);
//             fields_get.push(select);
//             if (properties.ignore === true) return;
//             fields_query.push(select);
//         });
//         this._CONFIG.fields_query = fields_query.join(',');
//         this._CONFIG.fields_get = fields_get.join(',')
//         const WHERE = [];
//         if (this._CONFIG.mark) {
//             let column = _.keys(this._CONFIG.mark)[0];
//             WHERE.push({ field: column, value: this._CONFIG.mark[column], condition: '!=' });
//         }
//         if (options && options.globalCondition && options.globalCondition.length) {
//             options.globalCondition.map(item => {
//                 let schema = this._CONFIG.COLUMN_MAP.get(this._C2F.get(item.column))
//                 if (schema) {
//                     WHERE.push({ ...item, type: getFieldType(schema) })
//                 } else {
//                     console.error(item)
//                 }
//             })
//         }
//         this._CONFIG.WHERE_FIX = fixWhere(this._CONFIG.COLUMN_MAP, WHERE);
//     }

//     async add(object) {
//         const result = await super.add(object)
//         return await this.getById(result as any)
//     }

// }
