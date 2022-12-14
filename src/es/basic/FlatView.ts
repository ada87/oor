import type { TObject, Static, TSchema } from '@sinclair/typebox';
import type { QuerySchema, WhereParam, WhereDefine, USchema } from '../../base/types';
import type { TableOptions } from '../../base/BaseView'
import type { SearchRequest, SearchResponse, Field, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import _ from 'lodash';
import { PAGE_SIZE } from '../../base/Util';
import { BaseQuery } from './BaseQuery'
import { queryToCondition, getFieldType } from '../../base/QueryBuilder';
import type { OrderByLimit } from './define';
import { fxecutor as executor } from './executor';
import { where, fixWhere, buildSearch } from './dsl';

const ES_MAX_SIZE = 10000;

export class FlatView<T extends TObject> extends BaseQuery {

    protected _index: string;

    private _F2C = new Map<string, string>(); // Field To Column
    private _C2F = new Map<string, string>(); // Column To Field

    protected _CONFIG = {
        sort: null,
        mark: null,
        fields_exclude: [],
        pageSize: PAGE_SIZE,
        FIELD_MAP: new Map<string, USchema>(),
        globalFilter: null as QueryDslQueryContainer,
    }
    protected _QUERY_CACHE = new Map<string, WhereDefine>();




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
        this._CONFIG.fields_exclude = [] as Field[];

        this._CONFIG.FIELD_MAP = new Map<string, TSchema>();
        var WHERE = [];
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            let column = properties.column || field;
            this._F2C.set(field, column);
            this._C2F.set(column, field);
            this._CONFIG.FIELD_MAP.set(field, properties);
            if (_.has(properties, 'delMark') && properties.delMark != null) {
                this._CONFIG.mark = { [column]: properties.delMark };
                WHERE.push({ field: column, value: properties.delMark, condition: '!=' });
            }
            if (properties.ignore) {
                this._CONFIG.fields_exclude.push(column)
                return;
            }
        });

        if (options == null) {
            this._CONFIG.globalFilter = fixWhere(WHERE);
            return;
        }
        if (options.key) {
            if (this._CONFIG.sort == null) {
                this._CONFIG.sort = { [options.key]: options.sortBy ? options.sortBy : 'desc' };
            }
        }
        if (options.sortOrder) this._CONFIG.sort = { [options.sortOrder]: options.sortBy ? options.sortBy : 'desc' };
        if (options.pageSize) this._CONFIG.pageSize = options.pageSize;
        if (options.globalCondition && options.globalCondition.length) {
            options.globalCondition.map(item => {
                let schema = this._CONFIG.FIELD_MAP.get(this._C2F.get(item.column))
                if (schema) {
                    WHERE.push({ ...item, type: getFieldType(schema) })
                } else {
                    console.error(item)
                }
            })
        };
        this._CONFIG.globalFilter = fixWhere(WHERE);


    };


    all(): Promise<Static<T>[]> {
        const orderBy = this.orderByLimit({ start_: 0, count_: ES_MAX_SIZE });
        return this._query(null, orderBy)
    }


    private async _query(param: QueryDslQueryContainer, orderBy: OrderByLimit): Promise<Static<T>[]> {
        const { _CONFIG: { fields_exclude, globalFilter } } = this;
        const request = buildSearch(this._index, param, orderBy, fields_exclude, globalFilter)
        return executor.query(this.getClient(), request)
    }


    /**
     * @see WhereCondition
     * Use a WhereCondition Query Data 
    */
    queryByCondition(condition?: WhereParam, query?: QuerySchema): Promise<Static<T>[]> {
        const { _CONFIG: { pageSize } } = this;
        const param = where(condition);
        let orderBy: OrderByLimit;
        if (query) {
            orderBy = this.orderByLimit(query);
        } else {
            orderBy = this.orderByLimit({ start_: 0, count_: pageSize });
        }
        return this._query(param, orderBy)
    }


    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data 
    */
    query(query?: QuerySchema): Promise<Static<T>[]> {
        const { _QUERY_CACHE, _CONFIG: { FIELD_MAP, } } = this;
        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        return this.queryByCondition(condition, query)
    }


    /**
     * Exec A Senctence
    */
    sql(request?: SearchRequest): Promise<SearchResponse<Static<T>>> {
        return this.getClient().search(request);
    }


    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data With Page
     * this will return a object with {total:number,list:any[]}
    */
    async queryPager(query?: QuerySchema): Promise<{ total: number, list: Static<T>[] }> {

        const { _QUERY_CACHE, _CONFIG: { FIELD_MAP, fields_exclude, globalFilter } } = this;
        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        const orderBy = this.orderByLimit(query);
        const param = where(condition);
        const request = buildSearch(this._index, param, orderBy, fields_exclude, globalFilter);
        return executor.queryPager(this.getClient(), request)
    }

    protected byField(field: string, value?: string | number | boolean): QueryDslQueryContainer {
        const { _CONFIG: { globalFilter, FIELD_MAP }, _F2C, _C2F } = this;
        let column = _F2C.has(field) ? _F2C.get(field) : (_C2F.has(field) ? field : null);
        if (column == null) {
            throw new Error(`Index ${this._index} do not has field ${field}`);
        }
        let schema = FIELD_MAP.get(_C2F.get(column));
        const type = getFieldType(schema);
        return where([{ column, type, value }]);
    }


    /**
     * Get A record form Table / View By Primary key.
     * This method will return All column. Even if the IGNORE column.
    */
    getById(id: string): Promise<Static<T>> {
        return executor.getById(this.getClient(), this._index, id);
    }
    /**
     * Get A record form Table / View By Specify Field = value.
     * This method will return All column. Even if the IGNORE column.
     * Note : If result has multi records , return the first row
     *        Want return all records?  use `queryByField`
    */
    getByField(field: string, value: string | number): Promise<Static<T>> {
        const { _CONFIG: { globalFilter, } } = this;
        const param = this.byField(field, value);
        const request = buildSearch(this._index, param, null, [], globalFilter)
        return executor.getOne(this.getClient(), request);
    }

    /**
     * Get records form Table / View By Specify Property = value.
    */
    queryByField(field: string, value?: string | number | boolean): Promise<Static<T>[]> {
        const param = this.byField(field, value);
        const orderBy = this.orderByLimit();
        return this._query(param, orderBy)
    }


    private orderByLimit(query?: QuerySchema): OrderByLimit {
        const { _CONFIG: { sort, pageSize, } } = this;
        let orderBy: OrderByLimit = {}
        if (query == null) {
            orderBy.from = 0;
            orderBy.size = pageSize;
            if (sort) orderBy.sort = sort;
            return orderBy
        }
        orderBy.from = query.start_ || 0;
        orderBy.size = query.count_ || pageSize;
        if (this._F2C.has(query.order_)) {
            let by = _.trim(query.by_) == 'asc' ? 'asc' : 'desc';
            orderBy.sort = `${this._F2C.get(query.order_)}:${by}`
        }
        return orderBy

    }

}