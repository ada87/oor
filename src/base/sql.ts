import type { WhereCondition, WhereItem } from './types';

type Primitive = string | number | boolean | Date | null | undefined;
type PlainObject = Record<string, Primitive>;

export type SqlInsert = (table: string, row: PlainObject) => [string, any];


export type SqlUpdate = (table: string, obj: PlainObject, key?: string) => [string, any[]];


export type SqlDelete = (table: string, id: string | number, key?: string) => [string, any[]];


export type SqlSelect = (table: string, id: string | number, fields?: string[], key?: string) => [string, any[]];


export type SqlCrud = {
    insert: SqlInsert,
    selectById: SqlSelect,
    updateById: SqlUpdate,
    deleteById: SqlDelete,
    whereByCondition: (condition: (WhereCondition) | (WhereItem[]), startIdx?: number) => [string, any[]],
}

export type SqlExecuter = {
    insert: (conn, sql: string, param: any) => Promise<any>,
    select: (conn, sql: string, param: any) => Promise<any[]>,
    selectById: (conn, sql: string, param: any) => Promise<any>,
    exec: (conn, sql: string, param: any) => Promise<number>,
    // deleteById: (conn, sql: string, param: any) => Promise<number>,
}