import type { Client, } from '@elastic/elasticsearch';
import type { SearchRequest, SearchHit, Field, QueryDslQueryContainer, IndexRequest, UpdateRequest, UpdateByQueryRequest, DeleteRequest, DeleteByQueryRequest } from '@elastic/elasticsearch/lib/api/types';
import type { ESExecutor, FlatExecutor } from './define';

import _ from 'lodash';
import { ShowSql } from '../../base/Util';


const logSearch = (request: SearchRequest) => {
    if (ShowSql == null) return
    let url = ['POST /', request.index, '/_search'];
    if (request._source_excludes && request._source_excludes.length) {
        url.push('?_source_excludes=')
        url.push((request._source_excludes as Field[]).join(','))
    }
    ShowSql(`${url.join('')} ${JSON.stringify({ ...request, _source_excludes: undefined, index: undefined, })}`)
}

const logExecuer = (method: string, url: string, param?: any) => {
    if (ShowSql == null) return
    return `${method} ${url} ${param != null ? JSON.stringify(param) : ''}`;
}

export const executor: ESExecutor<any> = {

    query: async (client: Client, request: SearchRequest): Promise<SearchHit<any>[]> => {
        logSearch(request);
        let result = await client.search(request)
        return result.hits.hits;
    },

    queryPager: async (client: Client, request: SearchRequest): Promise<{ total: number, list: SearchHit<any>[] }> => {
        logSearch(request);
        let total = 0;
        let result = await client.search(request)
        if (_.isNumber(result.hits.total)) {
            total = result.hits.total;
        } else {
            total = result.hits.total.value;
        }
        return { total, list: result.hits.hits };
    },



    add: async (client: Client, index: string, doc: any): Promise<any> => {
        logExecuer('POST', '/' + index + '/_doc', doc);
        const result = await client.index({ op_type: 'create', index, document: doc })
        if (result.result == 'created') {
            return {
                _id: result._id,
                _index: result._index,
                _version: result._version,
                _source: doc
            };
        }
        throw new Error();
    },

    getById: async (client: Client, index: string, id: string): Promise<any> => {
        logExecuer('GET', '/' + index + '/_doc/' + id);
        try {
            return await client.getSource({ id, index })
        } catch {
            return null;
        }
    },

    getOne: async (client: Client, request: SearchRequest): Promise<any> => {
        let param: SearchRequest = { ...request, from: 0, size: 1 }
        logSearch(param);
        const result = await client.search(request)
        if (result.hits.hits.length) {
            return result.hits.hits[0];
        }
        return null;
    },


    updateById: async (client: Client, index: string, id: string, entity: any, useIndex: boolean = false): Promise<number> => {
        if (useIndex) {
            let indexRequest: IndexRequest = { index, id, op_type: 'index', document: entity }
            logExecuer('PUT', '/' + index + '/_doc/' + id + '?optype=index', entity);
            const result = await client.index(indexRequest);
            return result.result == 'updated' ? 1 : 0;
        }
        let updateRequest: UpdateRequest = { index, id, doc: entity }
        logExecuer('POST', '/' + index + '/_update/' + id, { doc: entity });
        const result = await client.update(updateRequest);
        return result.result == 'updated' ? 1 : 0;

    },

    updateByQuery: async (client: Client, index: string, param: UpdateByQueryRequest): Promise<number> => {

        // const temp = await client.ingest.putPipeline({
        //     id: '',
        //     processors: [
        //         { set: { field: 'aa', value: bb } }
        //     ]
        // })
        // client
        client.updateByQuery({
            index,
            // conflicts: "proceed"
            script: {
                source: `ctx._source['extra'] = 'test'`
            }
        })
        return 1;
    },

    deleteById: async (client: Client, index: string, id: string): Promise<number> => {
        logExecuer('DELETE', '/' + index + '/_doc/' + id);
        const param: DeleteRequest = { id, index };
        try {
            const result = await client.delete(param)
            return result.result == 'deleted' ? 1 : 0;
        } catch (e) {
            console.error(e)
            return 0;
        }
    },

    deleteByQuery: async (client: Client, index: string, query: QueryDslQueryContainer): Promise<number> => {
        let request: DeleteByQueryRequest = {
            index,
            query,
        }
        ShowSql(JSON.stringify(request))

        return 1;
    },



}

export const fxecutor: FlatExecutor<any> = {
    
    ...executor,

    query: async (client: Client, request: SearchRequest): Promise<any[]> => {
        const result = await executor.query(client, request);
        return result.map(item => item._source);
    },

    queryPager: async (client: Client, request: SearchRequest): Promise<{ total: number, list: any[] }> => {
        const result = await executor.queryPager(client, request);
        return { total: result.total, list: result.list.map(item => item._source) };
    },

}
