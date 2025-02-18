import _ from 'lodash';
// import { PAGE_SIZE } from '../base/Util';
import { BaseQuery } from './BaseQuery'
import { queryToCondition, getFieldType } from '../base/QueryBuilder';
import { where, fixWhere, buildSearch } from './dsl';

import type { TObject, Static, TSchema } from '@sinclair/typebox';
import type { QuerySchema, WhereParam, WhereDefine, OColumn } from '../base/types';
import type { TableOptions } from '../base/BaseView'
import type { Field, QueryDslQueryContainer, Sort } from '@elastic/elasticsearch/lib/api/types';
import type { OrderByLimit, ESQuery } from './define';

type ESIndexOptions<T> = TableOptions & {
    getIndex?: (data: T) => string
}

const ES_MAX_SIZE = 10000;

export abstract class BaseView<S extends TObject, ROW> extends BaseQuery {

    protected _index: string;

    protected abstract _EXECUTOR: ESQuery<Static<S>, ROW>

    private _F2C = new Map<string, string>(); // Field To Column
    private _C2F = new Map<string, string>(); // Column To Field

    protected _CONFIG = {

        timeField: null as string,

        sort: null as Sort,
        mark: null,
        pageSize: PAGE_SIZE,
        COLUMN_MAP: new Map<string, OColumn>(),

        fields_exclude: [],
        globalFilter: null as QueryDslQueryContainer,
    }
    protected _QUERY_CACHE = new Map<string, WhereDefine>();

    protected getIndex: ((data: Static<S>) => string) = null;



    /**
     * @param tableName Data table name, "${schemaName}.${tableName}"  
     *  "${schemaName}." can be ignore with the default search_path.
     * @param schema The Object Schema, oor will not validate the value
     * @param options (Table/View) Options
     * 
    */
    constructor(indexName: string, schema: T, options?: ESIndexOptions<Static<S>>) {
        super();
        this._index = indexName;
        this._CONFIG.fields_exclude = [] as Field[];

        this._CONFIG.COLUMN_MAP = new Map<string, TSchema>();
        var WHERE = [];

        let field: string = null, by = 'desc' as any;
        let SortGuess: string[] = [];

        if (options.getIndex) this.getIndex = options.getIndex;

        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            let column = properties.column || field;
            this._F2C.set(field, column);
            this._C2F.set(column, field);
            this._CONFIG.COLUMN_MAP.set(field, properties);
            if (properties.isModify) SortGuess.push(field);
            if (_.has(properties, 'delMark') && properties.delMark != null) {
                this._CONFIG.mark = { [column]: properties.delMark };
                WHERE.push({ field: column, value: properties.delMark, condition: '!=' });
            }
            if (properties.ignore) this._CONFIG.fields_exclude.push(column);
        });
        if (options != null) {
            if (options.pageSize) this._CONFIG.pageSize = options.pageSize;
            if (options.key) {
                this._CONFIG.timeField = options.key;
                SortGuess.unshift(options.key);
            }
            if (options.sort) {
                field = options.sort.order;
                by = options.sort.by;
            }
        }

        if (field == null && SortGuess.length) field = SortGuess[0];
        if (field != null) {
            let column = this._F2C.has(field) ? this._F2C.get(field) : (this._C2F.has(field) ? field : null);
            if (column) this._CONFIG.sort = { [column]: by }
        }
        if (options.globalCondition && options.globalCondition.length) {
            options.globalCondition.map(item => {
                let schema = this._CONFIG.COLUMN_MAP.get(this._C2F.get(item.column))
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
        const { _QUERY_CACHE, _CONFIG: { COLUMN_MAP, } } = this;
        const condition = queryToCondition(query, COLUMN_MAP, _QUERY_CACHE);
        return this.queryByCondition(condition, query)
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
        const { _EXECUTOR, _QUERY_CACHE, _CONFIG: { COLUMN_MAP, fields_exclude, globalFilter } } = this;
        const condition = queryToCondition(query, COLUMN_MAP, _QUERY_CACHE);
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
        const { _CONFIG: { COLUMN_MAP }, _C2F } = this;
        let column = this.getColumn(field);
        let schema = COLUMN_MAP.get(_C2F.get(column));
        const type = getFieldType(schema);
        return where([{ column, type, value }]);
    }


    /**
     * Get A record form Table / View By Primary key.
     * This method will return All column. Even if the IGNORE column.
    */
    getById(id: string): Promise<Static<S>> {
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