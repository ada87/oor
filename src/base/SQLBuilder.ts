import type { TObject, Static } from '@sinclair/typebox';
import type { WhereParam, QuerySchema, Sort } from './types';
import type { BaseTable } from './BaseTable';
import type { BaseView, TableOptions } from './BaseView';
import { insert } from '../mysql/builder';

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


// export type SqlQuery<S extends TObject, C> = {
//     count: SqlCount<BaseView<S, C>>,
//     where: SqlWhere<BaseView<S, C>>,
//     byField: SqlByField<BaseView<S, C>>,
//     orderBy: SqlOrderBy<BaseView<S, C>>,
//     limit: SqlLimit<BaseView<S, C>>,
// }

// /**
//  * SqlBuilder
// */
// export type SqlBuilder<S extends TObject, C> = SqlQuery<S, C> & {
//     insert: SqlInsert<BaseTable<S, C>>,
//     select: SqlSelect<BaseTable<S, C>>,
//     update: SqlUpdate<BaseTable<S, C>>,
//     delete: SqlDelete<BaseTable<S, C>>,
//     returning: SqlReturning<BaseTable<S, C>>,
// }




class SQLQueryBuilder<S extends TObject> {

    constructor(schema: S, options: TableOptions) {

    }
    select(): string {
        return '';
    }

    count(): string {
        return '';
    }


    where(): string {
        return '';
    }
    byField(): string {
        return '';
    }
    orderBy(): string {
        return '';
    }
    limit(): string {
        return '';
    }
}


class SQLActionBuilder<S extends TObject> extends SQLQueryBuilder<S> {

    insert() {
        return '';
    }
    update() {
        return '';
    }
    delete() {
        return '';
    }
    returning() {
        return '';
    }

    //     insert: SqlInsert<BaseTable<S, C>>,
    //     select: SqlSelect<BaseTable<S, C>>,
    //     update: SqlUpdate<BaseTable<S, C>>,
    //     delete: SqlDelete<BaseTable<S, C>>,
    //     returning: SqlReturning<BaseTable<S, C>>,

}