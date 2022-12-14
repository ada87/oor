import type { WhereParam, QuerySchema, Sort } from './types';

type Primitive = string | number | boolean | Date | null | undefined;
export type PlainObject = Record<string, Primitive>;

export type SqlSelect = (table: string, fields?: any) => string;
export type SqlInsert = (table: string, row: PlainObject) => [string, any];
export type SqlUpdate = (table: string, obj: PlainObject, key?: string) => [string, any[]];
export type SqlDelete = (table: string) => string;
export type SqlCount = (table: string) => string;

export type SqlWhere = (condition: WhereParam, startIdx?: number) => [string, any[]];
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

    where: SqlWhere,
    byField: SqlByField,
    orderBy: SqlOrderBy,
    limit: SqlLimit,
}

export type BaseSqlExecutor = {
    query: (conn, sql: string, param?: any) => Promise<any[]>,
    get: (conn, sql: string, param?: any) => Promise<any>,
}

export type SqlExecutor<T> = BaseSqlExecutor & {
    add: (conn, sql: string, param: any) => Promise<T>,
    execute: (conn, sql: string, param?: any) => Promise<number>,
}