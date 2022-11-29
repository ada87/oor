import type { TObject, Static } from '@sinclair/typebox';
import type { QuerySchema, WhereCondition, USchema, WhereItem } from './types';
import { BaseQuery } from './BaseQuery';
declare type TableOptions = {
    /**
     * The Table Schema
     * default : 'public'
    */
    schema?: string;
    /**
     * primary key Column Default "id"
     * if not , must specfy key field
    */
    key?: string;
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
    pageSize?: number;
    /**
     * 默认查询过滤,比如 {field:'disabled',value:0,operation:'<>'}
     * 设置后，通过 query / all 拼装的 sql 都会带上 AND disabled <> 0
    */
    globalCondition: WhereItem[];
};
export declare class BaseView<T extends TObject> extends BaseQuery {
    protected _table: string;
    protected _CONFIG: {
        key: string;
        order: string;
        by: string;
        query_fields: string;
        pageSize: number;
        FIELD_MAP: Map<string, USchema>;
        globalCondition: any[];
    };
    private _QUERY_CACHE;
    constructor(tableName: string, schema: T, options?: TableOptions);
    private _query;
    /**
     * @see WhereCondition
     * Use a WhereCondition Query Data
    */
    queryByCondition(condition?: WhereCondition): Promise<Static<T, []>[]>;
    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data
    */
    query(query?: QuerySchema): Promise<Static<T>[]>;
    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data With Page
     * this will return a object with {total:number,list:any[]}
    */
    queryPager(query?: QuerySchema): Promise<{
        total: number;
        list: Static<T>[];
    }>;
    /**
     * Fetch All Records form the Table / View
    */
    all(): Promise<Static<T>[]>;
    /**
     * Get A record form Table / View By Specify key.
     * This method will return All column. Even if the IGNORE column.
    */
    getById(id: number | string): Promise<Static<T>>;
}
export {};
