import type { WhereParam, QuerySchema, Sort } from './types';

type Primitive = string | number | boolean | Date | null | undefined;
export type PlainObject = Record<string, Primitive>;

export type SqlSelectResult<T = any> = {
    rows: Array<T>,
    // fields: any[],
    rowCount: number,
    affectedRows: number,
}

export type SqlUpdateResult = {
    affectedRows: number,
    // rows: any[],
}


export type SqlSelect = (table: string, fields?: any) => string;
export type SqlInsert = (table: string, row: PlainObject) => [string, any];
export type SqlUpdate = (table: string, obj: PlainObject, key?: string) => [string, any[]];
export type SqlDelete = (table: string) => string;
export type SqlCount = (table: string) => string;

export type SqlWhere = (condition: WhereParam, startIdx?: number) => [string, any[]];
export type SqlReturning = () => string;
export type SqlByField = (field: string, value: string | number | boolean, startIdx?: number) => [string, any[]];

export type SqlOrderBy = (ftc: Map<string, string>, ctf: Map<string, string>, query?: QuerySchema, sort?: Sort) => string;
export type SqlLimit = (query?: QuerySchema, pageSize?: number) => string;

/**
 * SqlBuilder
*/
export type SqlBuilder = {
    insert: SqlInsert,
    select: SqlSelect,
    count: SqlCount,
    update: SqlUpdate,
    delete: SqlDelete,
    returning: SqlReturning,

    where: SqlWhere,
    byField: SqlByField,
    orderBy: SqlOrderBy,
    limit: SqlLimit,
}


export type BaseSqlExecutor<T> = {
    query: (conn, sql: string, param?: any) => Promise<T[]>,
    get: (conn, sql: string, param?: any) => Promise<T>,
}

export type SqlExecutor<T> = BaseSqlExecutor<T> & {
    add: {
        (conn, sql: string, param: any): Promise<T>,
        (conn, sql: string, param: any, returning: true): Promise<T>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    }
    addBatch: {
        (conn, sql: string, param: any): Promise<Array<T>>,
        (conn, sql: string, param: any, returning: true): Promise<T>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    },
    execute: {
        (conn, sql: string, param?: any): Promise<number>,
        (conn, sql: string, param: any, returning: false): Promise<number>,
        (conn, sql: string, param: any, returning: true): Promise<Array<T>>,
    },
}