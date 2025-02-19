
import type { Options, Sql, PostgresType } from 'postgres';
import type { QueryExecutor, ActionExecutor } from '../core';



export type ClientTypes = Record<string, PostgresType>;

export type PgSQL<T extends ClientTypes = ClientTypes> = Sql<Record<string, PostgresType> extends T ? {}
    : { [type in keyof T]: T[type] extends {
        serialize: (value: infer R) => any,
        parse: (raw: any) => infer R
    } ? R : never }>;




// class PgQuery<T extends PgSQL = PgSQL> implements QueryExecutor<PgSQL, object> {
//     query: (conn: PgSQL, sql: string, param?: object) => Promise<Array<object>>;
//     get: (conn: PgSQL, sql: string, param?: any) => Promise<Array<object>>;


// }
// class PgExecutor<T extends PgSQL = PgSQL> extends PgQuery implements ActionExecutor<PgSQL, any> {
//     add: { <O extends object>(conn: any, sql: string, param: any): Promise<O>; <O extends object>(conn: any, sql: string, param: any, returning: true): Promise<O>; (conn: any, sql: string, param: any, returning: false): Promise<Number>; };
//     addBatch: { <O extends object>(conn: any, sql: string, param: any): Promise<Array<O>>; <O extends object>(conn: any, sql: string, param: any, returning: true): Promise<O>; (conn: any, sql: string, param: any, returning: false): Promise<Number>; };
//     execute: { (conn: any, sql: string, param?: any): Promise<number>; (conn: any, sql: string, param: any, returning: false): Promise<number>; <O extends object>(conn: any, sql: string, param: any, returning: true): Promise<Array<O>>; };

// }

// export const PG_QUERY = new PgQuery();
// export const PG_EXECUTOR = new PgExecutor();