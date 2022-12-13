import type { Client } from '@elastic/elasticsearch';
import type { SearchRequest, SearchHit, Field, QueryDslQueryContainer, IndexRequest, UpdateByQueryRequest } from '@elastic/elasticsearch/lib/api/types';

export type OrderByLimit = Pick<SearchRequest, 'sort' | 'from' | 'size'>;

type BaseESExecutor<T> = {
    query: (client: Client, request: SearchRequest) => Promise<SearchHit<T>[]>,
    getOne: (client: Client, request: SearchRequest) => Promise<SearchHit<T>>,
    queryPager: (client: Client, request: SearchRequest) => Promise<{ total: number, list: SearchHit<T>[] }>
    getById: (client: Client, index: string, id: string) => Promise<T>,
}

type FlatESExecutor<T> = {
    query: (client: Client, request: SearchRequest) => Promise<T[]>,
    getOne: (client: Client, request: SearchRequest) => Promise<T>,
    getById: (client: Client, index: string, id: string) => Promise<T>,
    queryPager: (client: Client, request: SearchRequest) => Promise<{ total: number, list: T[] }>
}

type ESAction<T> = {
    add: (client: Client, index: string, param: IndexRequest) => Promise<T>,
    updateById: (client: Client, index: string, id: string, entity: any, useIndex?: boolean) => Promise<number>,
    updateByQuery: (client: Client, index: string, param: UpdateByQueryRequest) => Promise<number>,
    deleteById: (client: Client, index: string, id: string) => Promise<number>,
    deleteByQuery: (client: Client, index: string, query: QueryDslQueryContainer) => Promise<number>,
}

export type ESExecutor<T> = BaseESExecutor<T> & ESAction<T>;

export type FlatExecutor<T> = FlatESExecutor<T> & ESAction<T>;