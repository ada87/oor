// import _ from 'lodash';


import type { ClientBase } from 'pg';
import type { QueryExecutor, ActionExecutor } from '../base/sql';





class PgQuery implements QueryExecutor<ClientBase, object> {
    query: (conn: ClientBase, sql: string, param?: object) => Promise<Array<object>>;
    get: (conn: ClientBase, sql: string, param?: any) => Promise<Array<object>>;


}
class PgExecutor extends PgQuery implements ActionExecutor<ClientBase, object> {
    add: { <O extends object>(conn: any, sql: string, param: any): Promise<O>; <O extends object>(conn: any, sql: string, param: any, returning: true): Promise<O>; (conn: any, sql: string, param: any, returning: false): Promise<Number>; };
    addBatch: { <O extends object>(conn: any, sql: string, param: any): Promise<Array<O>>; <O extends object>(conn: any, sql: string, param: any, returning: true): Promise<O>; (conn: any, sql: string, param: any, returning: false): Promise<Number>; };
    execute: { (conn: any, sql: string, param?: any): Promise<number>; (conn: any, sql: string, param: any, returning: false): Promise<number>; <O extends object>(conn: any, sql: string, param: any, returning: true): Promise<Array<O>>; };

}

export const PG_QUERY = new PgQuery();
export const PG_EXECUTOR = new PgExecutor();