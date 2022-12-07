import type { TObject, Static, TSchema } from '@sinclair/typebox';
import type { QuerySchema, WhereParam, WhereDefine, USchema, WhereItem } from './types';

import _ from 'lodash';
import { PAGE_SIZE } from './Util';
import { BaseQuery } from './BaseQuery'
import { queryToCondition } from './QueryBuilder';

// import type { SqlExecutor } from './sql'

// const DEFAULT_SCHEMA = 'public';

export type TableOptions = {
    /**
     * primary key Column Default "id"
     * if not , must specfy key field
    */
    key?: string
    /**
     * The Table's Default Sorting Rule / Order Field
    */
    sortOrder?: string;
    /**
     * The Table's Default Sorting Rule / By Method
    */
    sortBy?: 'asc' | 'desc';
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

export abstract class BaseView<T extends TObject, C> extends BaseQuery<C> {

    protected _table: string;

    protected _CONFIG = {
        key: 'id',
        order: 'id',
        by: 'desc',
        fields_query: '*',
        fields_get: '*',
        mark: null,
        pageSize: PAGE_SIZE,
        FIELD_MAP: new Map<string, USchema>(),
        WHERE_FIX: ['', ' WHERE '] as [string, string],
        // globalCondition: [] as WhereItem[]
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
        // this._table = DEFAULT_SCHEMA + '.' + tableName;
        let fields_query = [];
        let fields_get = [];
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
            if (properties.column) {
                fields_get.push(`"${properties.column}" AS "${field}"`);
                if (properties.ignore === true) {
                    return;
                }
                fields_query.push(`"${properties.column}" AS "${field}"`);
            } else {
                fields_get.push('"' + field + '"');
                if (properties.ignore === true) {
                    return;
                }
                fields_query.push('"' + field + '"');
            }
        });
        this._CONFIG.fields_query = fields_query.join(',');
        this._CONFIG.fields_get = fields_get.join(',')
        if (options == null) {
            return;
        };
        if (options.sortOrder) this._CONFIG.order = options.sortOrder;
        if (options.sortBy) this._CONFIG.by = options.sortBy;
        if (options.pageSize) this._CONFIG.pageSize = options.pageSize;
        if (options.globalCondition && options.globalCondition.length) {
            WHERE = WHERE.concat(options.globalCondition)
        };
        if (options.key) {
            this._CONFIG.key = options.key;
            this._CONFIG.order = options.key;
        }
    };


    private async _query(WHERE, PARAM: string[] = [], ORDER_BY = '', LIMIT = ''): Promise<Static<T>[]> {
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
    queryByCondition(condition?: WhereParam): Promise<Static<T>[]> {
        const [WHERE, PARAM] = this._BUILDER.where(condition);
        return this._query(this.fixWhere(WHERE), PARAM);
    }


    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data 
    */
    query(query?: QuerySchema): Promise<Static<T>[]> {
        const { _QUERY_CACHE, _BUILDER, _CONFIG: { FIELD_MAP } } = this;
        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        const [WHERE, PARAM] = _BUILDER.where(condition);
        const [ORDER_BY, LIMIT] = this.orderByLimit(query);
        return this._query(this.fixWhere(WHERE), PARAM, ORDER_BY, LIMIT);
    }

    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data With Page
     * this will return a object with {total:number,list:any[]}
    */
    async queryPager(query?: QuerySchema): Promise<{ total: number, list: Static<T>[] }> {
        let total = 0;

        const { _table, _BUILDER, _EXECUTOR, _QUERY_CACHE, _CONFIG: { key, FIELD_MAP } } = this;
        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        const [WHERE, PARAM] = _BUILDER.where(condition);
        if (_.has(query, 'total_') && _.isNumber(query.total_)) {
            total = query.total_;
        } else {
            const SQL_COUNT = `${_BUILDER.count(_table, key)} ${this.fixWhere(WHERE)}`;
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
        const { _BUILDER, _CONFIG: { FIELD_MAP, order, by, pageSize } } = this;
        return [
            _BUILDER.orderBy(FIELD_MAP, query, order, by),
            _BUILDER.limit(query, pageSize)
        ]
    }


}