import type { TObject } from '@sinclair/typebox';
import type {
    SQLStatement, WhereCondition, WhereItem, WhereParam,
    QuerySchema, OrderBy, Limit, OrderByLimit
} from '../utils/types'

/**
 * Abbr Rule
 * T = Table  Object
 * V = View Object
 * S = Schema
 * C = Connection
 * O = Object
 * Q = Query Condition
 * W = Where Param
 *  */

/**
 * Database Options
*/
export type DatabaseOptions = {
    pageSize?: number
    rowKey?: string
    strictQuery?: boolean
    strictEntity?: boolean
}

export interface Database<C, Options extends DatabaseOptions = DatabaseOptions> {
    getConn: () => Promise<C>;
    getOption: () => Options;
}

export type TableOptions = DatabaseOptions & {
    /**
     * The Table's Default Sorting Rule : Order Field , By Method
    */
    orderBy?: OrderBy
    /**
     * 默认查询过滤,比如 { field:'disabled',value:0,operation:'<>' }
     * 设置后，通过 query / all 拼装的 sql 都会带上 AND disabled <> 0 
    */
    globalCondition?: Array<WhereItem>;
}




export interface QueryBuilder {

    /**
     * Query Fields : Only Return List Field, Not Include Detail Field
     * Detail Field : All Object Fields
    */
    select: {
        /**
         * Select Query Fields
        */
        (): string,
        /**
         * fasle(default) : Select Query Fields
         * true : Select Detail Fields
        */
        (isDetail: boolean): string,
        /**
         * Select Specified Fields,  Will check if the field is in the table
        */
        (specFields: Array<string>): string,
        /**
         * Select Specified Fields not check if the field is in the table
        */
        (specFields: string): string,
    }



    convertQuery: (query: QuerySchema) => WhereCondition;

    count: {
        (): string;
        (distinct: true): string;
        (field: string): string;
        (field: string, distinct: true): string;

    }
    byField: (field: string, value: string | number | boolean, startIdx?: number) => SQLStatement;
    byId: (value: string | number) => SQLStatement;
    orderBy: (query?: QuerySchema | boolean) => string;
    limit: {
        (count: number, start?: number): string
        (query: QuerySchema): string;
    }

    orderByLimit: (query?: QuerySchema | boolean) => string;

    where: (condition: WhereParam, startIdx?: number) => SQLStatement;

    fixWhere: {
        (statement?: SQLStatement): SQLStatement;
    }

}


export interface ActionBuilder extends QueryBuilder {
    // insert: (data: TObject, returning?: boolean) => SQLStatement;
    // update: (data: TObject, returning?: boolean) => SQLStatement;
    // delById: (id: string | number) => SQLStatement;

    // delete: () => SQLStatement;
}


export interface QueryExecutor<C, O> {

    
    query: {

        (conn: C, SQL: string): Promise<Array<O>>;
        <T>(conn: C, SQL: string): Promise<T>;

        (conn: C, SQL: string, PARAMS?: Array<any>): Promise<Array<O>>;
        <T>(conn: C, SQL: string, PARAMS?: Array<any>): Promise<T>;
    }

    get: {
        (conn: C, SQL: string, PARAMS?: Array<any>): Promise<O>
        <T>(conn: C, SQL: string, PARAMS?: Array<any>): Promise<T>
    }
    // (conn: C, SQL: string, WHERE: SQLStatement): Promise<Array<O>>;
    // (conn: C, SQL: string, ORDER_BY: string): Promise<Array<O>>;
    // (conn: C, SQL: string, ORDER_BY: string, WHERE: SQLStatement): Promise<Array<O>>;

    // queryPagination: (conn: C, select: string, where: string, orderBy: string, param?: Array<any> | object) => Promise<{ total: number, list: Array<O> }>
    // count: (conn: C, sql: string, param?: Array<any> | object) => Promise<number>;

    // get: (conn: C, sql: string, param?: Array<any> | object) => Promise<O>;
    // query: <O extends object>(conn: C, sql: string, param?: object) => Promise<Array<O>>;

    // get: <O extends object>(conn: C, sql: string, param?: any) => Promise<O>;

}





export interface ActionExecutor<C, O> extends QueryExecutor<C, O> {
    add: {
        (conn, sql: string, param: any): Promise<O>,
        (conn, sql: string, param: any, returning: true): Promise<O>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    }
    addBatch: {
        (conn, sql: string, param: any): Promise<Array<O>>,
        (conn, sql: string, param: any, returning: true): Promise<O>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    },
    execute: {
        (conn, sql: string, param?: any): Promise<number>,
        (conn, sql: string, param: any, returning: false): Promise<number>,
        (conn, sql: string, param: any, returning: true): Promise<Array<O>>,
    },

    // exec: (conn: C, sql: string, param?: Array<any> | object) => Promise<number>;

}




export interface View<O extends object = object> {

    all: (sort?: OrderBy) => Promise<Array<O>>;

    query: {
        (): Promise<Array<O>>
        (query: QuerySchema): Promise<Array<O>>,
    };
    queryPagination: (query?: QuerySchema) => Promise<{ total: number, list: Array<O> }>
    queryByField: (field: string, value: string | number | boolean, sort?: OrderBy) => Promise<Array<O>>;
    queryByCondition: (condition?: WhereParam, sort?: OrderByLimit) => Promise<Array<O>>;

    getById: (id: string | number) => Promise<O>
    getByField: (field: string, value: string | number) => Promise<O>;
    getByCondition: (condition: WhereParam) => Promise<O>;

}


export interface Table<O extends object> extends View<O> {

    // add: {
    //     (conn, sql: string, param: any): Promise<O>,
    //     (conn, sql: string, param: any, returning: true): Promise<O>,
    //     (conn, sql: string, param: any, returning: false): Promise<Number>,
    // }

    // addBatch: {
    //     (conn, sql: string, param: any): Promise<Array<O>>,
    //     (conn, sql: string, param: any, returning: true): Promise<O>,
    //     (conn, sql: string, param: any, returning: false): Promise<Number>,
    // },

    // update:{
    //     (conn, sql: string, param: any): Promise<O>,
    //     (conn, sql: string, param: any, returning: true): Promise<O>,
    //     (conn, sql: string, param: any, returning: false): Promise<Number>,
    // }


    // updateBatch:{
    //     (conn, sql: string, param: any): Promise<O>,
    //     (conn, sql: string, param: any, returning: true): Promise<O>,
    //     (conn, sql: string, param: any, returning: false): Promise<Number>,
    // }



    // updateById:(id: number | string)=> Promise<number>
    // updateByField:(field: string, value: string | number | boolean)=>Promise<number> ;
    // updateByQuery:(query: QuerySchema)=>Promise<number> 
    // updateByCondition:(condition: WhereParam)=> Promise<number> 

    // deleteById:(id: number | string)=> Promise<number>
    // deleteByField:(field: string, value: string | number | boolean)=>Promise<number> ;
    // deleteByQuery:(query: QuerySchema)=>Promise<number> 
    // deleteByCondition:(condition: WhereParam)=> Promise<number> 
    // execute: {
    //     (conn, sql: string, param?: any): Promise<number>,
    //     (conn, sql: string, param: any, returning: false): Promise<number>,
    //     (conn, sql: string, param: any, returning: true): Promise<Array<O>>,
    // },

}


export type QueryProvider<B extends QueryBuilder> = {
    new(tableName: string, schema: TObject, tbOptions?: TableOptions, dbOptions?: DatabaseOptions): B
};