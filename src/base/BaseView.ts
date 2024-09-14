import _ from 'lodash';
import { PAGE_SIZE } from './Util';
import { BaseQuery } from './BaseQuery'
import { queryToCondition } from './QueryBuilder';

import type { TObject, Static, TSchema } from '@sinclair/typebox';
import type { QuerySchema, WhereParam, WhereDefine, USchema, WhereItem, Sort } from './types';


const GLOBAL_ID_FIELD = new Set<string>(['id', 'uuid', 'guid']);

export type TableOptions = {
    /**
     * primary key Column Default "id"
     * if not , must specfy key field
    */
    key?: string
    /**
     * The Table's Default Sorting Rule : Order Field , By Method
    */
    sort?: Sort
    /**
     * 1. PageSize , if not specified , use DEFAULT_PAGESIZE 
     * 2. DEFAULT_PAGESIZE can use setup to specified default : 10
    */
    pageSize?: number,
    /**
     * 默认查询过滤,比如 {field:'disabled',value:0,operation:'<>'}
     * 设置后，通过 query / all 拼装的 sql 都会带上 AND disabled <> 0 
    */
    globalCondition?: WhereItem[];
}

// const WHERE_TO_STRING = ();


/**
 * @constructor
 * @param tableName TableName in database, (with schema in postgresql, eg: 'shcema.xxx')
 * @param schema  @see TObject define Table , use UType.Table
 * @param options  optional @see TableOptions smoe
 * 
*/
export abstract class BaseView<T extends TObject, Conn> extends BaseQuery<Conn> {

    protected _table: string;


    protected _F2C = new Map<string, string>(); // Field To Column
    protected _C2F = new Map<string, string>(); // Column To Field


    protected _CONFIG = {

        key: null as string,
        sort: null as Sort,
        mark: null,
        pageSize: PAGE_SIZE,
        FIELD_MAP: null as Map<string, USchema>,

        fields_query: '*',
        fields_get: '*',
        WHERE_FIX: ['', ' WHERE '] as [string, string],
    }

    protected _QUERY_CACHE = new Map<string, WhereDefine>();

    /**
     * @param tableName Data table name, "${schemaName}.${tableName}"  
     *  "${schemaName}." can be ignore with the default search_path.
     * @param schema The Object Schema, oor will not validate the value
     * @param options (Table/View) Options
     * 
    */
    constructor(tableName: string, schema: T, options?: TableOptions) {
        super();
        this._table = tableName;
        this._CONFIG.FIELD_MAP = new Map<string, TSchema>();
        let SortGuess: string[] = [];
        let field: string = null, by = 'desc' as any;
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            let column = properties.column || field;
            this._F2C.set(field, column);
            this._C2F.set(column, field);
            this._CONFIG.FIELD_MAP.set(field, properties);
            if (GLOBAL_ID_FIELD.has(column) && this._CONFIG.key == null) {
                this._CONFIG.key = column;
                SortGuess.push(field)
            };
            if (properties.isModify) SortGuess.unshift(field);
            if (_.has(properties, 'delMark') && properties.delMark != null) {
                this._CONFIG.mark = { [column]: properties.delMark };
            }
        });
        if (options != null) {
            if (options.pageSize) this._CONFIG.pageSize = options.pageSize;
            if (options.key) {
                this._CONFIG.key = options.key;
                SortGuess.push(this._CONFIG.key);
            }
            if (options.sort) {
                field = options.sort.order;
                by = options.sort.by;
            }
        }
        if (field == null && SortGuess.length) field = SortGuess[0];
        if (field != null) {
            let column = this._F2C.has(field) ? this._F2C.get(field) : (this._C2F.has(field) ? field : null);
            if (column) {
                this._CONFIG.sort = { order: column, by }
            }
        }
        this.init(schema, options);
    };


    protected abstract init(schema: T, options?: TableOptions): void;

    private async _query(WHERE, PARAM: ArrayLike<string> = [], ORDER_BY = '', LIMIT = ''): Promise<Static<T>[]> {
        const { _BUILDER, _EXECUTOR, _table, _CONFIG: { fields_query } } = this;
        const SQL_QUERY = _BUILDER.select(_table, fields_query);
        const SQL = `${SQL_QUERY} ${WHERE} ${ORDER_BY} ${LIMIT}`;
        const result = _EXECUTOR.query(this.getClient(), SQL, PARAM)
        return result;
    }


    /**
     * @see WhereCondition
     * Use a WhereCondition Query Data 
    */
    queryByCondition(condition?: WhereParam, limit?: QuerySchema): Promise<Static<T>[]> {
        const [WHERE, PARAM] = this._BUILDER.where(condition);
        if (limit) {
            const [ORDER_BY, LIMIT] = this.orderByLimit(limit);
            return this._query(this.fixWhere(WHERE), PARAM, ORDER_BY, LIMIT);
        }

        return this._query(this.fixWhere(WHERE), PARAM);
    }


    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data 
    */
    query(query?: QuerySchema): Promise<Static<T>[]> {
        const { _QUERY_CACHE, _CONFIG: { FIELD_MAP } } = this;
        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        return this.queryByCondition(condition, query)
    }

    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data With Page
     * this will return a object with {total:number,list:ArrayLike<T>}
    */
    async queryPager(query?: QuerySchema): Promise<{ total: number, list: Static<T>[] }> {
        let total = 0;
        const { _table, _BUILDER, _EXECUTOR, _QUERY_CACHE, _CONFIG: { FIELD_MAP } } = this;
        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        const [WHERE, PARAM] = _BUILDER.where(condition);
        if (_.has(query, 'total_') && _.isNumber(query.total_)) {
            total = query.total_;
        } else {
            const SQL_COUNT = `${_BUILDER.count(_table)} ${this.fixWhere(WHERE)}`;
            const countResult = await _EXECUTOR.get(this.getClient(), SQL_COUNT, PARAM);
            if (countResult == null) {
                return {
                    total: 0,
                    list: [],
                }
            }
            total = parseInt(countResult.total);
        }
        const [ORDER_BY, LIMIT] = this.orderByLimit(query);
        const list = await this._query(this.fixWhere(WHERE), PARAM, ORDER_BY, LIMIT)
        return { total, list }
    }

    /**
     * Fetch All Records form the Table / View
    */
    all(): Promise<Static<T>[]> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_query, WHERE_FIX } } = this;
        const SQL = _BUILDER.select(_table, fields_query) + WHERE_FIX[0];
        return _EXECUTOR.query(this.getClient(), SQL);
    }

    /**
     * Get A record form Table / View By Primary key.
     * This method will return All column. Even if the IGNORE column.
    */
    getById(id: number | string): Promise<Static<T>> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key, fields_get } } = this;
        if (key == null) throw new Error(`Table ${_table} do not have a Primary Key`);
        const SQL = _BUILDER.select(_table, fields_get);
        const [WHERE, PARAM] = _BUILDER.byField(key, id);
        return _EXECUTOR.get(this.getClient(), `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    }
    /**
     * Get A record form Table / View By Specify Field = value.
     * This method will return All column. Even if the IGNORE column.
     * Note : If result has multi records , return the first row
     *        Want return all records?  use `queryByField`
    */
    getByField(field: string, value?: string | number): Promise<Static<T>> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_get } } = this;
        const SQL = _BUILDER.select(_table, fields_get);
        const [WHERE, PARAM] = _BUILDER.byField(field, value);
        return _EXECUTOR.get(this.getClient(), `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    }

    /**
     * Get records form Table / View By Specify Property = value.
    */
    queryByField(field: string, value?: string | number | boolean): Promise<Static<T>[]> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_get } } = this;
        const SQL = _BUILDER.select(_table, fields_get);
        const [WHERE, PARAM] = _BUILDER.byField(field, value);
        return _EXECUTOR.query(this.getClient(), `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    }

    protected fixWhere(where: string): string {
        const { _CONFIG: { WHERE_FIX } } = this;
        let whereStr = _.trim(where);
        return whereStr.length ? (WHERE_FIX[0] + WHERE_FIX[1] + whereStr) : WHERE_FIX[0];
    }

    private orderByLimit(query?: QuerySchema): [string, string] {
        const { _BUILDER, _C2F, _F2C, _CONFIG: { sort, pageSize } } = this;
        return [
            _BUILDER.orderBy(_F2C, _C2F, query, sort),
            _BUILDER.limit(query, pageSize)
        ]
    }






}