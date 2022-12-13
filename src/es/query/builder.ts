import { SearchRequest, Field, QueryDslQueryContainer, QueryDslBoolQuery } from '@elastic/elasticsearch/lib/api/types';
import type { ESBuilder, OrderByLimit } from './es';
import { fixRequest } from './dsl';

export const ES_MAX_SIZE = 10000;
export const builder: ESBuilder = {

    // insert: () => {
    //     return null;
    // },
    // select: () => {
    //     return null;
    // },
    // count: () => {
    //     return null;
    // },
    // update: () => {
    //     return null;
    // },
    // delete: () => {
    //     return null;
    // },

    request: (indexName: string, query: QueryDslQueryContainer, order: OrderByLimit, _source_excludes: Field[], globalFilter: QueryDslQueryContainer): SearchRequest => {
        const param: SearchRequest = {
            index: indexName,
            ...order,
        };
        if (_source_excludes && _source_excludes.length) {
            param._source_excludes = _source_excludes;
        }
        param.query = fixRequest(globalFilter, query)
        return param;
    },


    where: () => {
        return null;
    },
    byField: () => {
        return null;
    },


    // sortLimit: () => {
    //     return null;
    // },

}

