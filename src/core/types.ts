import type { TObject } from '@sinclair/typebox';
import type { Sort, WhereItem, WhereParam, QuerySchema } from '../utils/types'

/**
 * 
 * Abbr Rule
 * T = Table  Object
 * V = View Object
 * S = Schema
 * C = Connection
 * O = Object
 * Q = Query Condition
 * W = Where Param
 *  */


export type DatabaseOptions = {
    pageSize?: number
    rowKey?: string
    strictQuery?: boolean
    strictEntity?: boolean
}

export type TableOptions = DatabaseOptions & {
    /**
     * The Table's Default Sorting Rule : Order Field , By Method
    */
    sort?: Sort
    /**
     * 默认查询过滤,比如 { field:'disabled',value:0,operation:'<>' }
     * 设置后，通过 query / all 拼装的 sql 都会带上 AND disabled <> 0 
    */
    globalCondition?: WhereItem[];
}


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

export interface ActionBuilder extends QueryBuilder {
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
