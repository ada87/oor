import type { Client } from '@elastic/elasticsearch';
import type { SearchRequest, SearchHit } from '@elastic/elasticsearch/lib/api/types';
import type { SqlExecutor } from '../../base/sql';
import _ from 'lodash';
import { ShowSql } from '../../base/Util';


type ESExecutor<T> = Omit<SqlExecutor<T>, 'execute'> & {

    update: (conn, sql: string, param?: any) => Promise<number>,
    delete: (conn, sql: string, param?: any) => Promise<number>,

}


export const executor: ESExecutor<SearchHit<any>> = {

    query: async (client: Client, index: string, body: any = null): Promise<SearchHit<any>[]> => {
        let param: SearchRequest = { index, ...body, };
        let result = await client.search(param)
        return result.hits.hits;
    },


    add: async (client: Client, index: string, doc: any): Promise<any> => {
        ShowSql(index, doc)
        const result = await client.index({ op_type: 'create', index, document: doc })
        if (result.result == 'created') {
            return result;
        }
        throw new Error();
    },

    get: async (client: Client, index: string, id: string): Promise<any> => {
        ShowSql(index, id)
        const result = await client.getSource({ id, index })
        return result;
    },





    update: async (client: Client, index: string, PARAM: any): Promise<number> => {
        // ShowSql(SQL, PARAM)
        // const result = await conn.query(SQL, PARAM);
        // return result.rowCount;

        // client.update({})


        return 1;
    },

    delete: async (client: Client, index: string, PARAM: any): Promise<number> => {
        // ShowSql(SQL, PARAM)
        // const result = await conn.query(SQL, PARAM);
        // return result.rowCount;
        // client.deleteByQuery({index:''})
        client.delete({ id: '', index })

        return 1;
    },

}


export const flatExecutor: ESExecutor<any> = {

    query: async (client: Client, index: string, body: any = null): Promise<any[]> => {
        let result = await executor.query(client, index, body);
        return result.map(item => item._source);
    },

    add: executor.add,

    get: executor.get,

    update: executor.update,

    delete: executor.delete,
}