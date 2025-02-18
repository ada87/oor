import type { TObject } from '@sinclair/typebox';
import type { WhereParam, QuerySchema, Sort } from '../utils/types';

export { BaseQueryBuilder } from './QueryBuilder';
export { BaseActionBuilder } from './ActionBuilder';


export interface QueryBuilder {
    select(fields?: string): string;
    count: (distinct?: boolean) => string;
    where: (condition: WhereParam, startIdx?: number) => [string, Array<any>];
    byField: (field: string, value: string | number | boolean, startIdx?: number) => [string, Array<any>];
    byId: (value: string | number) => [string, Array<any>];
    orderBy: (query?: QuerySchema, sort?: Sort) => string;
    limit: (query?: QuerySchema, pageSize?: number) => string;
    fixWhere: (where?: string, param?: Array<any>) => [string, Array<any>];
}

export interface ActionBuilder {
    insert: (data: TObject, returning?: boolean) => [string, any[]];
    update: (data: TObject, returning?: boolean) => [string, any[]];
    delete: () => string;
}


export interface QueryExecutor<C, O> {


    query: (conn: C, sql: string, param?: object) => Promise<Array<O>>;

    get: (conn: C, sql: string, param?: any) => Promise<O>;

    // query: <O extends object>(conn: C, sql: string, param?: object) => Promise<Array<O>>;

    // get: <O extends object>(conn: C, sql: string, param?: any) => Promise<O>;

}




export interface ActionExecutor<C, O> extends QueryExecutor<C, O> {
    add: {
        <O extends object>(conn, sql: string, param: any): Promise<O>,
        <O extends object>(conn, sql: string, param: any, returning: true): Promise<O>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    }
    addBatch: {
        <O extends object>(conn, sql: string, param: any): Promise<Array<O>>,
        <O extends object>(conn, sql: string, param: any, returning: true): Promise<O>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    },
    execute: {
        (conn, sql: string, param?: any): Promise<number>,
        (conn, sql: string, param: any, returning: false): Promise<number>,
        <O extends object>(conn, sql: string, param: any, returning: true): Promise<Array<O>>,
    },
}
