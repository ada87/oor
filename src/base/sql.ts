import type { WhereCondition, WhereItem, QuerySchema } from './types';

type Primitive = string | number | boolean | Date | null | undefined;
type PlainObject = Record<string, Primitive>;

export type SqlSelect = (table: string, fields?: string) => string;
export type SqlInsert = (table: string, row: PlainObject) => [string, any];
export type SqlUpdate = (table: string, obj: PlainObject, key?: string) => [string, any[]];
export type SqlDelete = (table: string) => string;

export type SqlById = (idValue: string | number, idKey?: string) => [string, any[]];
export type SqlWhere = (condition: (WhereCondition) | (WhereItem[]), startIdx?: number) => [string, any[]];
export type SqlOrderBy = (fieldSet: Map<string, any>, query?: QuerySchema, default_order?: string, default_by?: string) => string;
export type SqlLimit = (query?: QuerySchema, pageSize?: number) => string;

/**
 * SqlBuilder
*/
export type SqlBuilder = {
    insert: SqlInsert,
    select: SqlSelect,
    update: SqlUpdate,
    delete: SqlDelete,
    byId: SqlById,
    where: SqlWhere,
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