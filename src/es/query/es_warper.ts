import type { WhereParam, QuerySchema } from '../../base/types';
import type { Client } from '@elastic/elasticsearch';
import type { SearchRequest, SearchResponse, SearchHit, Field } from '@elastic/elasticsearch/lib/api/types';

type Primitive = string | number | boolean | Date | null | undefined;
export type PlainObject = Record<string, Primitive>;

export type ESSelect = (index: string, fields?: Field[]) => string;
export type ESInsert = (index: string, row: PlainObject) => [string, any];
export type ESUpdate = (index: string, obj: PlainObject, key?: string) => [string, any[]];
export type ESDelete = (index: string) => string;
export type ESCount = (table: string) => string;

export type ESWhere = (condition: WhereParam, startIdx?: number) => [string, any[]];
export type ESByField = (field: string, value: string | number | boolean, startIdx?: number) => [string, any[]];

export type ESOrderBy = (fieldSet: Map<string, any>, query?: QuerySchema, default_order?: string, default_by?: string) => string;
export type ESLimit = (query?: QuerySchema, pageSize?: number) => string;


export type ESBuilder = {
    insert: ESInsert,
    select: ESSelect,
    count: ESCount,
    update: ESUpdate,
    delete: ESDelete,

    where: ESWhere,
    byField: ESByField,
    orderBy: ESOrderBy,
    limit: ESLimit,
}

export type BaseESExecutor<T> = {
    query: (client: Client, index: string, param?: any) => Promise<SearchHit<T>[]>,
    get: (client: Client, index: string, param?: any) => Promise<SearchHit<T>>,
}

export type FlatESExecutor<T> = {
    query: (client: Client, index: string, param?: any) => Promise<T[]>,
    get: (client: Client, index: string, param?: any) => Promise<T>,

}

export type ESExecutor<T> = BaseESExecutor<T> & {
    add: (client: Client, index: string, param: any) => Promise<T>,
    execute: (client: Client, index: string, param?: any) => Promise<number>,
}

export type FlatExecutor<T> = FlatESExecutor<T> & {
    add: (client: Client, index: string, param: any) => Promise<T>,
    execute: (client: Client, index: string, param?: any) => Promise<number>,
}