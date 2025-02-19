import _ from 'lodash';
import { BaseView } from './BaseView';

import type { ActionExecutor, ActionBuilder, Table } from './types'
import type { TObject, Static } from '@sinclair/typebox';





export class BaseTable<C, S extends TObject, B extends ActionBuilder> extends BaseView<C, S, B> implements Table<Static<S>> {

    protected EXECUTOR: ActionExecutor<C, Static<S>>;

    
    protected checkEntity = null;

    add: { (conn: any, sql: string, param: any): Promise<Static<S>>; (conn: any, sql: string, param: any, returning: true): Promise<Static<S>>; (conn: any, sql: string, param: any, returning: false): Promise<Number>; };
    addBatch: { (conn: any, sql: string, param: any): Promise<Static<S>[]>; (conn: any, sql: string, param: any, returning: true): Promise<Static<S>>; (conn: any, sql: string, param: any, returning: false): Promise<Number>; };
    execute: { (conn: any, sql: string, param?: any): Promise<number>; (conn: any, sql: string, param: any, returning: false): Promise<number>; (conn: any, sql: string, param: any, returning: true): Promise<Static<S>[]>; };
}



// /**
//  * @param tableName Data table name, "${schemaName}.${tableName}"
//  *  "${schemaName}." can be ignore with the default search_path.
//  * @param schema The Object Schema, oor will not validate the value
//  * @param options (Table/View) Options
//  */
// constructor(p: Provider<B>, db: Database<C>, tbName: string, tbSchema: S, tbOptions?: TableOptions) {
//     super(db);
//     const dbOptions = db.getOptions();
//     this.BUILDER = new p(tbName, tbSchema, tbOptions, dbOptions);
//     this.STRICT_QUERY = tbOptions?.strictQuery || dbOptions?.strictQuery || false;
//     this.init();
// }