import type { WhereParam, QuerySchema } from '../../base/types';
import type { PlainObject } from '../../base/sql';


export type SqlSelect = (indexName: string, fields?: any) => string;
export type SqlInsert = (indexName: string, row: PlainObject) => [string, any];
export type SqlUpdate = (indexName: string, obj: PlainObject, key?: string) => [string, any[]];
export type SqlDelete = (indexName: string) => string;
export type SqlCount = (indexName: string) => string;

export type SqlWhere = (condition: WhereParam, startIdx?: number) => [string, any[]];
export type SqlByField = (field: string, value: string | number | boolean, startIdx?: number) => [string, any[]];

export type SqlOrderBy = (fieldSet: Map<string, any>, query?: QuerySchema, default_order?: string, default_by?: string) => string;
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