import type { TObject, Static } from '@sinclair/typebox';
import type { WhereParam, QuerySchema, Sort } from './types';
import type { BaseTable } from './BaseTable';
import type { BaseView } from './BaseView';

// T = Table  Object
// V = View Object
// S = Schema
// C = Connection

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


export type SqlSelect<T> = (table: T, fields?: any) => string;
export type SqlInsert<T> = (table: T, row: PlainObject) => [string, any];
export type SqlUpdate<T> = (table: T, obj: PlainObject, key?: string) => [string, any[]];
export type SqlDelete<T> = (table: T) => string;
export type SqlReturning<T> = (table: T) => string;

export type SqlCount<V> = (table: V) => string;
export type SqlWhere<V> = (table: V, condition: WhereParam, startIdx?: number) => [string, any[]];
export type SqlByField<V> = (table: V, field: string, value: string | number | boolean, startIdx?: number) => [string, any[]];
export type SqlOrderBy<V> = (table: V, ftc: Map<string, string>, ctf: Map<string, string>, query?: QuerySchema, sort?: Sort) => string;
export type SqlLimit<V> = (table: V, query?: QuerySchema, pageSize?: number) => string;


export type SqlQuery<S extends TObject, C> = {
    count: SqlCount<BaseView<S, C>>,
    where: SqlWhere<BaseView<S, C>>,
    byField: SqlByField<BaseView<S, C>>,
    orderBy: SqlOrderBy<BaseView<S, C>>,
    limit: SqlLimit<BaseView<S, C>>,
}

/**
 * SqlBuilder
*/
export type SqlBuilder<S extends TObject, C> = SqlQuery<S, C> & {
    insert: SqlInsert<BaseTable<S, C>>,
    select: SqlSelect<BaseTable<S, C>>,
    update: SqlUpdate<BaseTable<S, C>>,
    delete: SqlDelete<BaseTable<S, C>>,
    returning: SqlReturning<BaseTable<S, C>>,
}

export interface View<S extends TObject, C> {
    readonly _BUILDER: SqlQuery<S, C>,

    query: (conn: C, sql: string, param?: any) => Promise<Static<S>[]>,
    get: (conn: C, sql: string, param?: any) => Promise<Static<S>>,

}
export interface Table<S extends TObject, C> {
    // query: (conn: C, sql: string, param?: any) => Promise<Static<S>[]>,
    // get: (conn: C, sql: string, param?: any) => Promise<Static<S>>,

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