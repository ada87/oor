import type { Client } from '@elastic/elasticsearch';
import type { SearchRequest, QueryDslQueryContainer, IndexRequest, Script } from '@elastic/elasticsearch/lib/api/types';

export type OrderByLimit = Pick<SearchRequest, 'sort' | 'from' | 'size'>;

export interface ESQuery<T, R = T> {
    getById: (client: Client, index: string, id: string) => Promise<T>,
    getOne: (client: Client, request: SearchRequest) => Promise<R>,
    query: (client: Client, request: SearchRequest) => Promise<R[]>,
    queryPager: (client: Client, request: SearchRequest) => Promise<{ total: number, list: R[] }>
}


export interface ESAction<T> {
    add: (client: Client, index: string, param: IndexRequest) => Promise<T>,
    updateById: (client: Client, index: string, id: string, entity: any, useIndex?: boolean) => Promise<number>,
    updateByQuery: (client: Client, index: string, param: QueryDslQueryContainer, script: Script) => Promise<number>,
    deleteById: (client: Client, index: string, id: string) => Promise<number>,
    deleteByQuery: (client: Client, index: string, query: QueryDslQueryContainer) => Promise<number>,
}