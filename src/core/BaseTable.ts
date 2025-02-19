import { BaseView, } from './BaseView';
import _ from 'lodash';

import type { ActionExecutor, ActionBuilder } from './types'
import type { View } from './BaseView'
import type { TObject, Static } from '@sinclair/typebox';


export interface Table<O extends object> extends View<O> {
    add: {
        (conn, sql: string, param: any): Promise<O>,
        (conn, sql: string, param: any, returning: true): Promise<O>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    }
    addBatch: {
        (conn, sql: string, param: any): Promise<Array<O>>,
        (conn, sql: string, param: any, returning: true): Promise<O>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    },
    execute: {
        (conn, sql: string, param?: any): Promise<number>,
        (conn, sql: string, param: any, returning: false): Promise<number>,
        (conn, sql: string, param: any, returning: true): Promise<Array<O>>,
    },
}


export class BaseTable<C, S extends TObject, B extends ActionBuilder> extends BaseView<C, S, B> implements Table<Static<S>> {

    protected EXECUTOR: ActionExecutor<C, Static<S>>;
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