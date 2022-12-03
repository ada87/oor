import _ from 'lodash';
import { PAGE_SIZE } from './Util';
import type { TObject, Static, TSchema } from '@sinclair/typebox';
import type { QuerySchema, WhereCondition, WhereDefine, USchema, WhereItem } from './types';
import { BaseQuery } from './BaseQuery'
import { queryToCondition } from './QueryBuilder';
// import type { SqlExecutor } from './sql'

const DEFAULT_SCHEMA = 'public';

type TableOptions = {
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



export abstract class BaseView<T extends TObject> extends BaseQuery {

    protected _table: string;



    protected _CONFIG = {
        key: 'id',
        order: 'id',
        by: 'desc',
        query_fields: '*',
        get_fields: '*',
        pageSize: PAGE_SIZE,
        FIELD_MAP: new Map<string, USchema>(),
        globalCondition: []
    }

    private _QUERY_CACHE = new Map<string, WhereDefine>();

    /**
     * @param tableName Data table name, "${schemaName}.${tableName}"  
     *  "${schemaName}." can be ignore with the default search_path.
     * @param schema The Object Schema, oor will not validate the value
     * @param options (Table/View) Options
     * 
    */
    constructor(tableName: string, schema: T, options?: TableOptions) {
        super();
        let fields = [];
        let fields_all = [];
        this._CONFIG.FIELD_MAP = new Map<string, TSchema>();
        _.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            this._CONFIG.FIELD_MAP.set(field, properties);
            if (properties.column) {
                fields_all.push(`"${properties.column}" AS "${field}"`);
                if (properties.ignore === true) {
                    return;
                }
                fields.push(`"${properties.column}" AS "${field}"`);
            } else {
                fields_all.push('"' + field + '"');
                if (properties.ignore === true) {
                    return;
                }
                fields.push('"' + field + '"');
            }
        });
        this._table = DEFAULT_SCHEMA + '.' + tableName;
        this._CONFIG.query_fields = fields.join(',');
        this._CONFIG.get_fields = fields_all.join(',')
        if (options == null) return;
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
        const { _BUILDER, _EXECUTOR, _table, _CONFIG: { query_fields } } = this;
        const SQL_QUERY = _BUILDER.select(_table, query_fields);
        const SQL = `${SQL_QUERY}
${WHERE} 
${ORDER_BY} 
${LIMIT}`;
        console.log(SQL, PARAM)
        const result = _EXECUTOR.query(this.db(), SQL, PARAM)
        return result;
    }


    /**
     * @see WhereCondition
     * Use a WhereCondition Query Data 
    */
    queryByCondition(condition?: WhereCondition) {
        // TODO check condition
        const [WHERE, PARAM] = this._BUILDER.where(condition);
        return this._query(WHERE, PARAM);
    }


    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data 
    */
    query(query?: QuerySchema): Promise<Static<T>[]> {
        const { _QUERY_CACHE, _BUILDER, _CONFIG: { FIELD_MAP } } = this;
        const condition = queryToCondition(query, FIELD_MAP, _QUERY_CACHE);
        const [WHERE, PARAM] = _BUILDER.where(condition, 1);
        const [ORDER_BY, LIMIT] = this.orderByLimit(query);
        return this._query(WHERE, PARAM, ORDER_BY, LIMIT);
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
        const [WHERE, PARAM] = _BUILDER.where(condition, 1);
        if (_.has(query, 'total_') && _.isNumber(query.total_)) {
            total = query.total_;
        } else {
            const SQL_COUNT = `${_BUILDER.count(_table, key)} ${WHERE}`;
            const countResult = await _EXECUTOR.get(this.db(), SQL_COUNT, PARAM);
            if (countResult == null) {
                return {
                    total: 0,
                    list: [],
                }
            }
            total = parseInt(countResult.total);
        }
        const [ORDER_BY, LIMIT] = this.orderByLimit(query);
        const list = await this._query(WHERE, PARAM, ORDER_BY, LIMIT)
        return { total, list }
    }

    /**
     * Fetch All Records form the Table / View
    */
    all(): Promise<Static<T>[]> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { query_fields, globalCondition } } = this;
        const SQL = _BUILDER.select(_table, query_fields);
        if (globalCondition.length) {
            const [WHERE, PARAM] = _BUILDER.where(globalCondition);
            return _EXECUTOR.query(this.db(), `${SQL} ${WHERE}`, PARAM);
        }
        return _EXECUTOR.query(this.db(), SQL);
    }

    /**
     * Get A record form Table / View By Specify key.
     * This method will return All column. Even if the IGNORE column.
    */
    getById(id: number | string): Promise<Static<T>> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key, get_fields } } = this;
        console.log(get_fields)
        const SQL = _BUILDER.select(_table, get_fields);
        const [WHERE, PARAM] = _BUILDER.byId(id, key);
        return _EXECUTOR.get(this.db(), `${SQL} ${WHERE}`, PARAM);
    }

    private orderByLimit(query?: QuerySchema): [string, string] {
        const { _BUILDER, _CONFIG: { FIELD_MAP, order, by, pageSize } } = this;
        return [
            _BUILDER.orderBy(FIELD_MAP, query, order, by),
            _BUILDER.limit(query, pageSize)
        ]
    }


    protected whereByQuery(query?: QuerySchema, startIdx = 1) {
        const condition = queryToCondition(query, this._CONFIG.FIELD_MAP, this._QUERY_CACHE);
        return this._BUILDER.where(condition, startIdx)
    }
}



