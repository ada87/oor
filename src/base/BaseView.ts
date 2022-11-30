import _ from 'lodash';
import { selectById, selectAll } from '../sql';
import type { TObject, Static, TSchema } from '@sinclair/typebox';
import type { QuerySchema, WhereCondition, WhereDefine, USchema, WhereItem } from './types';
import { BaseQuery } from './BaseQuery'
import { orderByLimit, DEFAULT_PAGE_SIZE } from './QueryPagition';
import { whereByCondition } from './QueryWhere';
import { whereByQuery } from './QueryBuilder';

const DEFAULT_SCHEMA = 'public';

type TableOptions = {
    /**
     * The Table Schema 
     * default : 'public'
    */
    schema?: string;
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
    globalCondition: WhereItem[];
}



export class BaseView<T extends TObject> extends BaseQuery {

    protected _table: string;

    protected _CONFIG = {
        key: 'id',
        order: 'id',
        by: 'desc',
        query_fields: '*',
        pageSize: DEFAULT_PAGE_SIZE,
        FIELD_MAP: new Map<string, USchema>(),
        globalCondition: []
    }

    private _QUERY_CACHE = new Map<string, WhereDefine>();

    constructor(tableName: string, schema: T, options?: TableOptions) {
        super();
        let fields = [];
        this._CONFIG.FIELD_MAP = new Map<string, TSchema>();
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            this._CONFIG.FIELD_MAP.set(field, properties);
            if (properties.ignore === true) {
                return;
            }
            if (properties.column) {
                fields.push(`"${properties.column}" AS "${field}"`);
            } else {
                fields.push('"' + field + '"');
            }
        });
        this._table = DEFAULT_SCHEMA + '.' + tableName;
        this._CONFIG.query_fields = fields.join(',');
        if (options == null) return;
        if (options.schema) this._table = options.schema + '.' + tableName;
        if (options.key) {
            this._CONFIG.key = options.key;
            this._CONFIG.order = options.key;
        }
        if (options.sortOrder) this._CONFIG.order = options.sortOrder;
        if (options.sortBy) this._CONFIG.by = options.sortBy;
        if (options.pageSize) this._CONFIG.pageSize = options.pageSize;
        if (options.globalCondition && options.globalCondition.length) this._CONFIG.globalCondition = options.globalCondition;
    }

    private async _query(WHERE, PARAM: string[] = [], ORDER_BY = '', LIMIT = ''): Promise<Static<T>[]> {
        const SQL_QUERY = `SELECT ${this._CONFIG.query_fields}  
FROM ${this._table} 
${WHERE} ${ORDER_BY} ${LIMIT}`;
        console.log(SQL_QUERY, PARAM)
        const queryResult = await this.sql(SQL_QUERY, PARAM);

        return queryResult.rows;
    }


    /**
     * @see WhereCondition
     * Use a WhereCondition Query Data 
    */
    queryByCondition(condition?: WhereCondition) {
        // TODO check condition
        const [WHERE, PARAM] = whereByCondition(condition);
        return this._query(WHERE, PARAM);
    }


    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data 
    */
    query(query?: QuerySchema): Promise<Static<T>[]> {
        const { FIELD_MAP, order, by, pageSize } = this._CONFIG;
        const [WHERE, PARAM] = whereByQuery(query, FIELD_MAP, this._QUERY_CACHE);
        const [ORDER_BY, LIMIT] = orderByLimit(FIELD_MAP, query, pageSize, order, by);
        console.log(WHERE, PARAM, ORDER_BY, LIMIT)
        return this._query(WHERE, PARAM, ORDER_BY, LIMIT);
    }

    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data With Page
     * this will return a object with {total:number,list:any[]}
    */
    async queryPager(query?: QuerySchema): Promise<{ total: number, list: Static<T>[] }> {
        let total = 0;
        const { key, order, by, pageSize, FIELD_MAP } = this._CONFIG;
        const [WHERE, PARAM] = whereByQuery(query, FIELD_MAP, this._QUERY_CACHE);
        if (_.has(query, 'total_') && _.isNumber(query.total_)) {
            total = query.total_;
        } else {
            const SQL_COUNT = `SELECT COUNT(${key}) AS total FROM ${this._table} ${WHERE}`;
            const countResult = await this.sql(SQL_COUNT, PARAM);
            if (countResult.rowCount != 1) {
                return {
                    total: 0,
                    list: [],
                }
            }
            total = parseInt(countResult.rows[0].total);
        }
        const [ORDER_BY, LIMIT] = orderByLimit(FIELD_MAP, query, pageSize, order, by);
        const list = await this._query(WHERE, PARAM, ORDER_BY, LIMIT)
        return { total, list }
    }

    /**
     * Fetch All Records form the Table / View
    */
    all(): Promise<Static<T>[]> {
        return selectAll(this.db(), this._table, this._CONFIG.query_fields);
    }

    /**
     * Get A record form Table / View By Specify key.
     * This method will return All column. Even if the IGNORE column.
    */
    getById(id: number | string): Promise<Static<T>> {
        return selectById(this.db(), this._table, id, [], this._CONFIG.key);
    }


}



