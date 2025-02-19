import _ from 'lodash';

import type {TableOptions, DatabaseOptions} from './types';
import type { QueryBuilder } from './index';
import type { TObject } from '@sinclair/typebox';
import type { WhereParam,  Sort, Column  } from '../utils/types';


const DEFAULT_PAGE_SIZE = 10;
const GLOBAL_ID_FIELD = new Set<string>(['id', 'uuid', 'guid']);



export class BaseQueryBuilder implements QueryBuilder {

    protected readonly tableName: string;

    // readonly select: string

    protected readonly rowKey: string;

    protected readonly pageSize: number;

    // protected fieldsQuery: string = '*';
    // protected fieldsGget: string = '*';

    protected COLUMN_MAP: Map<string, Column>;

    protected readonly DEL_MARK: { field: string, value: string | number | boolean, } = null;
    protected readonly DEFAULT_SORT: Sort = null;
    // protected

    protected WHERE_FIX: [string, string] = ['', ' WHERE '];


    protected readonly _F2C = new Map<string, string>(); // Field To Column
    protected readonly _C2F = new Map<string, string>(); // Column To Field

    // private orderByLimit(query?: QuerySchema): OrderByLimit {
    //     const { _CONFIG: { sort, pageSize, } } = this;
    //     let orderBy: OrderByLimit = {}
    //     if (query == null) {
    //         orderBy.from = 0;
    //         orderBy.size = pageSize;
    //         if (sort) orderBy.sort = sort;
    //         return orderBy
    //     }
    //     orderBy.from = query.start_ || 0;
    //     orderBy.size = query.count_ || pageSize;
    //     if (this._F2C.has(query.order_)) {
    //         orderBy.sort = { [this._F2C.get(query.order_)]: _.trim(query.by_) == 'asc' ? 'asc' : 'desc' }
    //     }
    //     return orderBy

    // }


    constructor(tbName: string, tbSchema: TObject, tbOption: TableOptions, dbOption: DatabaseOptions) {
        this.tableName = tbName;
        this.rowKey = tbOption?.rowKey;
        // || ;
        this.pageSize = tbOption?.pageSize || dbOption?.pageSize || DEFAULT_PAGE_SIZE;
        this.COLUMN_MAP = new Map<string, Column>();
        let SortGuess: string[] = [];
        if (tbOption.sort) {

        }
        // let field: string = null, by = 'desc' as any;
        const fields = _.keys(tbSchema.properties);
        for (let field of fields) {

            let properties = tbSchema.properties[field];
            let column = properties.column || field;
            this._F2C.set(field, column);
            this._C2F.set(column, field);
            this.COLUMN_MAP.set(field, properties);
            // if (GLOBAL_ID_FIELD.has(column) && this.rowKey == null) {
            //     // this._CONFIG.key = column;
            //     this.rowKey = column;
            //     SortGuess.push(field)
            // };
            if (properties.isModify) SortGuess.unshift(field); // 默认按最后修改时间
            if (_.has(properties, 'delMark') && properties.delMark != null) {

                this.DEL_MARK = {
                    field: column,
                    value: properties.delMark,
                    // [column]: properties.delMark
                };
            }
        };
        // this.DEL_MARK = null;
        if (tbOption?.sort) {

            // if (options.sort) {
            // field = options.sort.order;
            // by = options.sort.by;
            // }
        }
        if (this.rowKey == null) {
            this.rowKey = dbOption?.rowKey || 'id';
        }
        // if (field == null && SortGuess.length) field = SortGuess[0];
        // if (field != null) {
        //     let column = this._F2C.has(field) ? this._F2C.get(field) : (this._C2F.has(field) ? field : null);
        //     if (column) {
        //         this._CONFIG.sort = { order: column, by }
        //     }
        // }
        // this.init(schema, options);
        // options.pageSize = options.pageSize || 10;
        // this._table = '';
    }
    select(fields?: string): string {
        throw new Error('Method not implemented.');
    }
    byId: (value: string | number) => [string, Array<any>];
    fixWhere: (where?: string, param?: Array<any>) => [string, Array<any>];


    where(condition: WhereParam, startIdx: number = 0): [string, any[]] {
        let whereClause = '';
        const params: any[] = [];
        let idx = startIdx;

        for (const [field, value] of Object.entries(condition)) {
            if (whereClause.length > 0) {
                whereClause += ' AND ';
            }
            whereClause += `${field} = $${idx}`;
            params.push(value);
            idx++;
        }

        return [whereClause, params];
    }
    byField: (field: string, value: string | number | boolean, startIdx?: number) => [string, any[]];


    count(): string {
        return '';
    }


    // where(query: QuerySchema): string {
    //     return '';
    // }
    // byId(id: string | number): string {
    //     return ''
    // }
    // byField(field: string, value: string | number | boolean | Date): string {
    //     return '';
    // }
    orderBy(): string {
        return '';
    }
    limit(): string {
        return '';
    }





    // /** 
    //  * _BUILDER: SqlBuilder  - SQL Query Builder for db
    // *   @see SqlBuilder
    // */
    // protected abstract _BUILDER: SqlQuery<S, C>;

    // /** 
    // * _EXECUTOR: BaseSqlExecutor  - SQL Executer for db
    // *      @see BaseSqlExecutor
    // */
    // protected abstract _EXECUTOR: BaseSqlExecutor<Static<S>>;



    // protected _QUERY_CACHE = new Map<string, WhereDefine>();

    // /**
    //  * @param tableName Data table name, "${schemaName}.${tableName}"  
    //  *  "${schemaName}." can be ignore with the default search_path.
    //  * @param schema The Object Schema, oor will not validate the value
    //  * @param options (Table/View) Options
    //  * 
    // */
    // constructor(db: Database<C>, tableName: string, schema: S, options?: TableOptions) {
    //     super(db);
    //     this._table = tableName;

    // };


    // protected abstract init(schema: S, options?: TableOptions): void;

    // private async _query(WHERE, PARAM: ArrayLike<string> = [], ORDER_BY = '', LIMIT = ''): Promise<Static<S>[]> {
    //     const { _BUILDER, _EXECUTOR, _table, _CONFIG: { fields_query } } = this;
    //     const SQL_QUERY = _BUILDER.select(_table, fields_query);
    //     const SQL = `${SQL_QUERY} ${WHERE} ${ORDER_BY} ${LIMIT}`;
    //     const conn = await this.getConn();
    //     const result = _EXECUTOR.query(conn, SQL, PARAM)
    //     return result;
    // }


    // /**
    //  * @see WhereCondition
    //  * Use a WhereCondition Query Data 
    // */
    // queryByCondition(condition?: WhereParam, limit?: QuerySchema): Promise<Static<S>[]> {
    //     const [WHERE, PARAM] = this._BUILDER.where(condition);
    //     if (limit) {
    //         const [ORDER_BY, LIMIT] = this.orderByLimit(limit);
    //         return this._query(this.fixWhere(WHERE), PARAM, ORDER_BY, LIMIT);
    //     }

    //     return this._query(this.fixWhere(WHERE), PARAM);
    // }


    // /**
    //  * @see QuerySchema
    //  * Use a QuerySchema Query Data 
    // */
    // query(query?: QuerySchema): Promise<Static<S>[]> {
    //     const { _QUERY_CACHE, _CONFIG: { COLUMN_MAP } } = this;
    //     const condition = queryToCondition(query, COLUMN_MAP, _QUERY_CACHE);
    //     return this.queryByCondition(condition, query)
    // }

    // /**
    //  * @see QuerySchema
    //  * Use a QuerySchema Query Data With Page
    //  * this will return a object with {total:number,list:ArrayLike<T>}
    // */
    // async queryPager(query?: QuerySchema): Promise<{ total: number, list: Static<S>[] }> {
    //     let total = 0;
    //     const { _table, _BUILDER, _EXECUTOR, _QUERY_CACHE, _CONFIG: { COLUMN_MAP } } = this;
    //     const condition = queryToCondition(query, COLUMN_MAP, _QUERY_CACHE);
    //     const [WHERE, PARAM] = _BUILDER.where(condition);
    //     if (_.has(query, 'total_') && _.isNumber(query.total_)) {
    //         total = query.total_;
    //     } else {
    //         const SQL_COUNT = `${_BUILDER.count(_table)} ${this.fixWhere(WHERE)}`;
    //         const conn = await this.getConn();
    //         const countResult = await _EXECUTOR.get(conn, SQL_COUNT, PARAM);
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

    // /**
    //  * Fetch All Records form the Table / View
    // */
    // async all(): Promise<Static<S>[]> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_query, WHERE_FIX } } = this;
    //     const SQL = _BUILDER.select(_table, fields_query) + WHERE_FIX[0];
    //     const conn = await this.getConn();;
    //     return _EXECUTOR.query(conn, SQL);
    // }

    // /**
    //  * Get A record form Table / View By Primary key.
    //  * This method will return All column. Even if the IGNORE column.
    // */
    // async getById(id: number | string): Promise<Static<S>> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key, fields_get } } = this;
    //     if (key == null) throw new Error(`Table ${_table} do not have a Primary Key`);
    //     const SQL = _BUILDER.select(_table, fields_get);
    //     const [WHERE, PARAM] = _BUILDER.byField(key, id);
    //     const conn = await this.getConn()
    //     return _EXECUTOR.get(conn, `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    // }
    // /**
    //  * Get A record form Table / View By Specify Field = value.
    //  * This method will return All column. Even if the IGNORE column.
    //  * Note : If result has multi records , return the first row
    //  *        Want return all records?  use `queryByField`
    // */
    // async getByField(field: string, value?: string | number): Promise<Static<S>> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_get } } = this;
    //     const SQL = _BUILDER.select(_table, fields_get);
    //     const [WHERE, PARAM] = _BUILDER.byField(field, value);
    //     const conn = await this.getConn()
    //     return _EXECUTOR.get(conn, `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    // }

    // /**
    //  * Get records form Table / View By Specify Property = value.
    // */
    // async queryByField(field: string, value?: string | number | boolean): Promise<Static<S>[]> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_get } } = this;
    //     const SQL = _BUILDER.select(_table, fields_get);
    //     const [WHERE, PARAM] = _BUILDER.byField(field, value);
    //     const conn = await this.getConn()
    //     return _EXECUTOR.query(conn, `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    // }

    // protected fixWhere(where: string): string {
    //     const { _CONFIG: { WHERE_FIX } } = this;
    //     let whereStr = _.trim(where);
    //     return whereStr.length ? (WHERE_FIX[0] + WHERE_FIX[1] + whereStr) : WHERE_FIX[0];
    // }

    // private orderByLimit(query?: QuerySchema): [string, string] {
    //     const { _C2F, _F2C, _CONFIG: { sort, pageSize } } = this;
    //     return [
    //         // _BUILDER.orderBy(_F2C, _C2F, query, sort),
    //         // _BUILDER.limit(query, pageSize)
    //     ]
    // }




    // byId: (value: string | number) => string;
}



    // export const select: SqlSelect = (table: string, fields: string = '*'): string => `SELECT ${fields || '*'} FROM ${table} `;

    // export const count: SqlCount = (table: string) => `SELECT count(0) AS total FROM ${table}`;
    
    // export const insert: SqlInsert = (table: string, obj: any): [string, any[]] => {
    //     const fields = _.keys(obj);
    //     if (fields.length == 0) {
    //         throw new Error();
    //     }
    //     let query = [];
    //     let idx = [];
    //     let param = [];
    
    //     fields.map((field, i) => {
    //         let val = obj[field];
    //         if (val === null) {
    //             return
    //         }
    //         query.push(field)
    //         idx.push("$" + (i + 1));
    //         param.push(val)
    //     })
    //     return [`INSERT INTO ${table} (${query.join(',')}) VALUES (${idx.join(',')}) RETURNING *`, param];
    // }
    
    // export const update: SqlUpdate = (table: string, obj: any, key = 'id'): [string, any[]] => {
    //     const fields = _.keys(obj);
    //     if (fields.length == 0) throw new Error();
    //     let query = [];
    //     let param = [];
    
    //     let diff = 1;
    //     fields.map((field, i) => {
    //         // Not Allow Update Primary Key
    //         if (field == key) {
    //             diff = 0;
    //             return;
    //         }
    //         let val = obj[field];
    //         query.push(`${field} = $${i + diff}`)
    //         param.push(val)
    //     });
    //     // console.log(`UPDATE  ${table} SET ${query.join(',')} RETURNING *`)
    
    //     return [`UPDATE  ${table} SET ${query.join(',')}`, param];
    // }
    
    // export const del: SqlDelete = (table: string): string => `DELETE FROM ${table} `
    
    
    
    
    
    // export const byField: SqlByField = (field: string, id: string | number, startIdx: number = 1) => [` ${field} = $${startIdx} `, [id]];
