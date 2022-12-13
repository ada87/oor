import type { Client } from '@elastic/elasticsearch';
import type { SearchRequest, SearchHit, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import type { ESExecutor } from './es';
import _ from 'lodash';
import { ShowSql } from '../../base/Util';


export const executor: ESExecutor<any> = {

    query: async (client: Client, request: SearchRequest): Promise<SearchHit<any>[]> => {
        ShowSql(JSON.stringify(request))
        let result = await client.search(request)
        return result.hits.hits;
    },

    queryPager: async (client: Client, request: SearchRequest): Promise<{ total: number, list: SearchHit<any>[] }> => {
        ShowSql(JSON.stringify(request))
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
        ShowSql(index, doc)
        const result = await client.index({ op_type: 'create', index, document: doc })
        if (result.result == 'created') {
            return result;
        }
        throw new Error();
    },

    getById: async (client: Client, index: string, id: string): Promise<any> => {
        ShowSql(index, id)
        const result = await client.getSource({ id, index })
        return result;
    },

    getOne: async (client: Client, request: SearchRequest): Promise<any> => {
        let param: SearchRequest = { ...request, from: 0, size: 1 }
        ShowSql(JSON.stringify(param))
        const result = await client.search(request)
        if (result.hits.hits.length) {
            return result.hits.hits[0];
        }
        return null;

    },


    execute: async (client: Client, index: string, id: string): Promise<any> => {

    }




    // update: async (client: Client, index: string, PARAM: any): Promise<number> => {
    //     // ShowSql(SQL, PARAM)
    //     // const result = await conn.query(SQL, PARAM);
    //     // return result.rowCount;

    //     // client.update({})


    //     return 1;
    // },

    // delete: async (client: Client, index: string, PARAM: any): Promise<number> => {
    //     // ShowSql(SQL, PARAM)
    //     // const result = await conn.query(SQL, PARAM);
    //     // return result.rowCount;
    //     // client.deleteByQuery({index:''})
    //     client.delete({ id: '', index })

    //     return 1;
    // },

}


// export const flatExecutor: ESExecutor<any> = {

//     query: async (client: Client, index: string, body: any = null): Promise<any[]> => {
//         let result = await executor.query(client, index, body);
//         return result.map(item => item._source);
//     },

//     add: executor.add,

//     get: executor.get,

//     update: executor.update,

//     delete: executor.delete,
// }