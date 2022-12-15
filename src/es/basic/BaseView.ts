import type { TObject, Static, TSchema } from '@sinclair/typebox';
import type { QuerySchema, WhereParam, WhereDefine, USchema } from '../../base/types';
import type { TableOptions } from '../../base/BaseView'
import type { SearchRequest, SearchResponse, Field, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import _ from 'lodash';
import { PAGE_SIZE } from '../../base/Util';
import { BaseQuery } from './BaseQuery'
import { queryToCondition, getFieldType } from '../../base/QueryBuilder';
import type { OrderByLimit, ESQuery } from './define';

import { where, fixWhere, buildSearch } from './dsl';

const ES_MAX_SIZE = 10000;

export abstract class BaseView<T extends TObject, ROW> extends BaseQuery {

    protected _index: string;

    protected abstract _EXECUTOR: ESQuery<T, ROW>

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

    /**
     * @returns return Type dependson Constructor and Entity :
     *    Use View / Table ： Return Array< SearchHit<Entity> >
     *    Use FlatView ： Return Array< Entity >
    */
    all(): Promise<ROW[]> {
        const orderBy = this.orderByLimit({ start_: 0, count_: ES_MAX_SIZE });
        return this._query(null, orderBy)
    }


    private async _query(param: QueryDslQueryContainer, orderBy: OrderByLimit): Promise<ROW[]> {
        const { _EXECUTOR, _CONFIG: { fields_exclude, globalFilter } } = this;
        const request = buildSearch(this._index, param, orderBy, fields_exclude, globalFilter)
        return _EXECUTOR.query(this.getClient(), request)
    }


    /**
     * @see WhereCondition
     *    Use a WhereCondition Query Data 
     * @returns return Type dependson Constructor and Entity :
     *    Use View / Table ： Return Array< SearchHit<Entity> >
     *    Use FlatView ： Return Array< Entity >
    */
    queryByCondition(condition?: WhereParam, query?: QuerySchema): Promise<ROW[]> {
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
     *      Use a QuerySchema Query Data 
     * @returns return Type dependson Constructor and Entity :
     *    Use View / Table ： Return Array< SearchHit<Entity> >
     *    Use FlatView ： Return Array< Entity >
    */
    query(query?: QuerySchema): Promise<ROW[]> {
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
     *    Use a QuerySchema Query Data With Page
     *    this will return a object with {total:number,list:any[]}
     * @returns return Type dependson Constructor and Entity :
     *    property : list
     *    Use View / Table ： Return Array < SearchHit <Entity> >
     *    Use FlatView ： Return Array < Entity >
    */
    async queryPager(query?: QuerySchema): Promise<{ total: number, list: ROW[] }> {
        const { _EXECUTOR, _QUERY_CACHE, _CONFIG: { FIELD_MAP, fields_exclude, globalFilter } } = this;
        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        const orderBy = this.orderByLimit(query);
        const param = where(condition);
        const request = buildSearch(this._index, param, orderBy, fields_exclude, globalFilter);
        return _EXECUTOR.queryPager(this.getClient(), request)
    }

    protected getField(key: string) {
        const { _F2C, _C2F } = this;
        let field = _F2C.has(key) ? key : (_C2F.has(key) ? _C2F.get(key) : null);
        if (field == null) {
            throw new Error(`Index ${this._index} do not has field ${field}`);
        }
        return field;
    }

    protected getColumn(key: string) {
        const { _F2C, _C2F } = this;
        let column = _F2C.has(key) ? _F2C.get(key) : (_C2F.has(key) ? key : null);
        if (column == null) {
            throw new Error(`Index ${this._index} do not has field ${key}`);
        }
        return column;
    }

    protected byField(field: string, value?: string | number | boolean): QueryDslQueryContainer {
        const { _CONFIG: { FIELD_MAP }, _C2F } = this;
        let column = this.getColumn(field);
        let schema = FIELD_MAP.get(_C2F.get(column));
        const type = getFieldType(schema);
        return where([{ column, type, value }]);
    }


    /**
     * Get A record form Table / View By Primary key.
     * This method will return All column. Even if the IGNORE column.
    */
    getById(id: string): Promise<Static<T>> {
        return this._EXECUTOR.getById(this.getClient(), this._index, id);
    }
    /**
     * Get A record form Table / View By Specify Field = value.
     * This method will return All column. Even if the IGNORE column.
     * Note : If result has multi records , return the first row
     *        Want return all records?  use `queryByField`
    */
    getByField(field: string, value: string | number): Promise<ROW> {
        const { _EXECUTOR, _CONFIG: { globalFilter, } } = this;
        const param = this.byField(field, value);
        const request = buildSearch(this._index, param, null, [], globalFilter)
        return _EXECUTOR.getOne(this.getClient(), request);
    }

    /**
     * Get records form Table / View By Specify Property = value.
    */
    queryByField(field: string, value?: string | number | boolean): Promise<ROW[]> {
        const param = this.byField(field, value);
        const orderBy = this.orderByLimit();
        return this._query(param, orderBy)
    }


    //
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
            orderBy.sort = { [this._F2C.get(query.order_)]: _.trim(query.by_) == 'asc' ? 'asc' : 'desc' }
        }
        return orderBy

    }

}