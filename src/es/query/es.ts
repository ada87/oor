import type { WhereParam, QuerySchema } from '../../base/types';
import type { Client } from '@elastic/elasticsearch';
import type { SearchRequest, SearchResponse, SearchHit, Field, QueryDslQueryContainer, QueryDslBoolQuery } from '@elastic/elasticsearch/lib/api/types';

type Primitive = string | number | boolean | Date | null | undefined;
export type PlainObject = Record<string, Primitive>;

export type OrderByLimit = Pick<SearchRequest, 'sort' | 'from' | 'size'>;


export type ESSelect = (index: string, fields?: Field[]) => string;
export type ESInsert = (index: string, row: PlainObject) => [string, any];
export type ESUpdate = (index: string, obj: PlainObject, key?: string) => [string, any[]];
export type ESDelete = (index: string) => string;
export type ESCount = (table: string) => string;

export type ESWhere = (condition: WhereParam, startIdx?: number) => [string, any[]];
export type ESByField = (field: string, value: string | number | boolean, startIdx?: number) => [string, any[]];

// export type ESOrderByLimit = (fieldSet: Map<string, any>, query?: QuerySchema, default_sort?: string, default_page_size?: number) => OrderByLimit;


export type ESBuilder = {
    // insert: ESInsert,
    // select: ESSelect,
    // count: ESCount,
    // update: ESUpdate,
    // delete: ESDelete,
    request(indexName: string, query: QueryDslQueryContainer, order: OrderByLimit, _source_excludes: Field[], globalFilter: QueryDslQueryContainer): SearchRequest,

    where: ESWhere,
    byField: ESByField,
    // sortLimit: ESOrderByLimit,


}

export type BaseESExecutor<T> = {
    query: (client: Client, request: SearchRequest) => Promise<SearchHit<T>[]>,
    getOne: (client: Client, request: SearchRequest) => Promise<SearchHit<T>>,
    queryPager: (client: Client, request: SearchRequest) => Promise<{ total: number, list: SearchHit<T>[] }>
    getById: (client: Client, index: string, id: string) => Promise<T>,
}

export type FlatESExecutor<T> = {
    query: (client: Client, request: SearchRequest) => Promise<T[]>,
    getOne: (client: Client, request: SearchRequest) => Promise<T>,
    getById: (client: Client, index: string, id: string) => Promise<T>,
    queryPager: (client: Client, request: SearchRequest) => Promise<{ total: number, list: T[] }>

}

export type ESExecutor<T> = BaseESExecutor<T> & {
    add: (client: Client, index: string, param: any) => Promise<T>,
    execute: (client: Client, index: string, param?: any) => Promise<number>,
}

export type FlatExecutor<T> = FlatESExecutor<T> & {
    add: (client: Client, index: string, param: any) => Promise<T>,
    execute: (client: Client, index: string, param?: any) => Promise<number>,
}