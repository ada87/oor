import type { TObject, Static, TSchema } from '@sinclair/typebox';
import type { QuerySchema, WhereParam, WhereDefine, USchema, WhereItem } from '../../base/types';
import type { TableOptions } from '../../base/BaseView'
import type { SearchRequest, SearchResponse, SearchHit, Field } from '@elastic/elasticsearch/lib/api/types';

import _ from 'lodash';
import { PAGE_SIZE } from '../../base/Util';
import { BaseQuery } from './BaseQuery'
import { queryToCondition } from '../../base/QueryBuilder';

const ES_MAX_SIZE = 10000;

// import { SqlBuilder, SqlExecutor } from '../../base/sql';

// const ES: SqlBuilder = {
//     insert: (table: string, row: PlainObject) => [table, row]
// }
// (item => client.index({ index: 'user', op_type: 'create', document: item, })


import { executor } from '../query/executor';
import { where } from '../query/dsl';

export class View<T extends TObject> extends BaseQuery<T> {

    protected _index: string;


    protected _CONFIG = {
        key: null as string | null,
        mark: null,
        pageSize: PAGE_SIZE,
        FIELD_MAP: new Map<string, USchema>(),
        WHERE_FIX: ['', ' WHERE '] as [string, string],
        BASE_QUERY: {} as SearchRequest,
        // globalCondition: [] as WhereItem[]
    }
    protected _QUERY_CACHE = new Map<string, WhereDefine>();

    all(): Promise<SearchHit<Static<T>>[]> {
        const { _CONFIG: { BASE_QUERY } } = this;
        return executor.query(this.getClient(), this._index, { ...BASE_QUERY, from: 0, size: ES_MAX_SIZE })
    }



    /**
     * @param tableName Data table name, "${schemaName}.${tableName}"  
     *  "${schemaName}." can be ignore with the default search_path.
     * @param schema The Object Schema, oor will not validate the value
     * @param options (Table/View) Options
     * 
    */
    constructor(indexName: string, schema: T, options?: TableOptions) {
        super();
        this._index = indexName;
        this._CONFIG.BASE_QUERY.index = indexName;

        this._CONFIG.BASE_QUERY.from = 0;
        this._CONFIG.BASE_QUERY._source_excludes = [] as Field[];

        this._CONFIG.FIELD_MAP = new Map<string, TSchema>();
        var WHERE = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            let column = properties.column || field;
            this._CONFIG.FIELD_MAP.set(field, properties);
            if (_.has(properties, 'delMark') && properties.delMark != null) {
                this._CONFIG.mark = { [column]: properties.delMark };
                WHERE.push({ field: column, value: properties.delMark, condition: '!=' });
            }
            if (properties.ignore) {
                (this._CONFIG.BASE_QUERY._source_excludes as Field[]).push(field)
                return;
            }

            // if (properties.column) {
            //     fields_get.push(`"${properties.column}" AS "${field}"`);
            //     fields_query.push(`"${properties.column}" AS "${field}"`);
            // } else {
            //     fields_get.push('"' + field + '"');
            //     if (properties.ignore === true) {
            //         return;
            //     }
            //     fields_query.push('"' + field + '"');
            // }
        });

        if (this._CONFIG.BASE_QUERY._source_excludes.length == 0) _.unset(this._CONFIG, '_source_excludes');


        if (options == null) return;
        if (options.sortOrder) this._CONFIG.BASE_QUERY.sort = { [options.sortOrder]: options.sortBy ? options.sortBy : 'desc' };
        if (options.pageSize) this._CONFIG.pageSize = options.pageSize;
        if (options.globalCondition && options.globalCondition.length) {
            // WHERE = WHERE.concat(options.globalCondition)
        };
        if (options.key) {
            this._CONFIG.key = options.key;
            if (this._CONFIG.BASE_QUERY.sort == null) {
                this._CONFIG.BASE_QUERY.sort = { [options.key]: options.sortBy ? options.sortBy : 'desc' };
            }
        }

    };


    // private async _query(WHERE, PARAM: string[] = [], ORDER_BY = '', LIMIT = ''): Promise<Static<T>[]> {
    //     const { _BUILDER, _EXECUTOR, _table, _CONFIG: { fields_query } } = this;
    //     const SQL_QUERY = _BUILDER.select(_table, fields_query);
    //     const SQL = `${SQL_QUERY} ${WHERE} ${ORDER_BY} ${LIMIT}`;
    //     const result = _EXECUTOR.query(this.getClient(), SQL, PARAM)
    //     return result;
    // }


    // /**
    //  * @see WhereCondition
    //  * Use a WhereCondition Query Data 
    // */
    // queryByCondition(condition?: WhereParam): Promise<Static<T>[]> {
    //     const [WHERE, PARAM] = this._BUILDER.where(condition);
    //     return this._query(this.fixWhere(WHERE), PARAM);
    // }


    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data 
    */
    query(query?: QuerySchema): Promise<SearchHit<Static<T>>[]> {
        const { _QUERY_CACHE, _CONFIG: { FIELD_MAP } } = this;

        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        const dsl = where(condition);
        return executor.query(this.getClient(), this._index, dsl)
    }


    /**
 * Exec A Senctence
*/
    sql(request?: SearchRequest): Promise<SearchResponse<Static<T>>> {
        return this.getClient().search(request);
    }


    // /**
    //  * @see QuerySchema
    //  * Use a QuerySchema Query Data With Page
    //  * this will return a object with {total:number,list:any[]}
    // */
    // async queryPager(query?: QuerySchema): Promise<{ total: number, list: Static<T>[] }> {
    //     let total = 0;

    //     const { _table, _BUILDER, _EXECUTOR, _QUERY_CACHE, _CONFIG: { key, FIELD_MAP } } = this;
    //     const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
    //     const [WHERE, PARAM] = _BUILDER.where(condition);
    //     if (_.has(query, 'total_') && _.isNumber(query.total_)) {
    //         total = query.total_;
    //     } else {
    //         const SQL_COUNT = `${_BUILDER.count(_table, key)} ${this.fixWhere(WHERE)}`;
    //         const countResult = await _EXECUTOR.get(this.getClient(), SQL_COUNT, PARAM);
    //         if (countResult == null) {
    //             return {
    //                 total: 0,
    //                 list: [],
    //             }
    //         }
    //         total = parseInt(countResult.total);
    //     }
    //     const [ORDER_BY, LIMIT] = this.orderByLimit(query);
    //     const list = await this._query(this.fixWhere(WHERE), PARAM, ORDER_BY, LIMIT)
    //     return { total, list }
    // }



    /**
     * Get A record form Table / View By Primary key.
     * This method will return All column. Even if the IGNORE column.
    */
    // getById(id: string): Promise<Static<T>> {
    //     const { _index, _EXECUTOR, _CONFIG: { key, BASE_QUERY } } = this;
    //     const SQL = _BUILDER.select(_index, { ...BASE_QUERY });
    //     const [WHERE, PARAM] = _BUILDER.byField(key, id);
    //     return _EXECUTOR.get(this.getClient(), PARAM);
    // }
    /**
     * Get A record form Table / View By Specify Field = value.
     * This method will return All column. Even if the IGNORE column.
     * Note : If result has multi records , return the first row
     *        Want return all records?  use `queryByField`
    */
    // getByField(field: string, value?: string | number): Promise<Static<T>> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_get } } = this;
    //     const SQL = _BUILDER.select(_table, fields_get);
    //     const [WHERE, PARAM] = _BUILDER.byField(field, value);
    //     return _EXECUTOR.get(this.getClient(), `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    // }

    /**
     * Get records form Table / View By Specify Property = value.
    */
    // queryByField(field: string, value?: string | number | boolean): Promise<Static<T>[]> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_get } } = this;
    //     const SQL = _BUILDER.select(_table, fields_get);
    //     const [WHERE, PARAM] = _BUILDER.byField(field, value);
    //     return _EXECUTOR.query(this.getClient(), `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    // }

    // protected fixWhere(where: string): string {
    //     const { _CONFIG: { WHERE_FIX } } = this;
    //     let whereStr = _.trim(where);
    //     return whereStr.length ? (WHERE_FIX[0] + WHERE_FIX[1] + whereStr) : WHERE_FIX[0];
    // }




}