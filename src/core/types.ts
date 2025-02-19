import type { TObject } from '@sinclair/typebox';
import type { Sort, WhereItem, WhereParam, QuerySchema, WhereStatement } from '../utils/types'

/**
 * 
 * Abbr Rule
 * T = Table  Object
 * V = View Object
 * S = Schema
 * C = Connection
 * O = Object
 * Q = Query Condition
 * W = Where Param
 *  */


export type DatabaseOptions = {
    pageSize?: number
    rowKey?: string
    strictQuery?: boolean
    strictEntity?: boolean
}

export interface Database<C, Options extends DatabaseOptions = DatabaseOptions> {
    getConn: () => Promise<C>;
    getOptions: () => Options;
}

export type TableOptions = DatabaseOptions & {
    /**
     * The Table's Default Sorting Rule : Order Field , By Method
    */
    sort?: Sort
    /**
     * 默认查询过滤,比如 { field:'disabled',value:0,operation:'<>' }
     * 设置后，通过 query / all 拼装的 sql 都会带上 AND disabled <> 0 
    */
    globalCondition?: WhereItem[];
}


export interface QueryBuilder {
    select: {
        (): string,
        (isDetail: boolean): string,
        (specFields: Array<string>): string,
        (specFields: string): string,
    }
    byId: (value: string | number) => WhereStatement;
    count: (distinct?: boolean) => string;
    where: (condition: WhereParam, startIdx?: number) => WhereStatement;
    byField: (field: string, value: string | number | boolean, startIdx?: number) => WhereStatement;
    orderBy: (query?: QuerySchema, sort?: Sort) => string;
    limit: (query?: QuerySchema, pageSize?: number) => string;
    fixWhere: (where?: string, param?: Array<any>) => WhereStatement;
}


export interface ActionBuilder extends QueryBuilder {
    insert: (data: TObject, returning?: boolean) => WhereStatement;
    update: (data: TObject, returning?: boolean) => WhereStatement;
    // delById: (id: string | number) => WhereStatement;
    
    // delete: () => WhereStatement;
}


export interface QueryExecutor<C, O> {


    query: (conn: C, sql: string, param?: object) => Promise<Array<O>>;

    get: (conn: C, sql: string, param?: any) => Promise<O>;

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
}




export interface View<O extends object> {

    all: () => Promise<Array<O>>;
    getById: (id: string | number) => Promise<O>
    getByField: (field: string, value: string | number | Date) => Promise<O>;
    getByCondition: (condition: WhereParam) => Promise<O>;
    query: {
        (): Promise<Array<O>>
        (query: QuerySchema): Promise<Array<O>>,
    };
    queryPagination: (query?: QuerySchema) => Promise<{ total: number, list: Array<O> }>
    queryByField: (field: string, value?: string | number | boolean) => Promise<Array<O>>;
    queryByCondition: (condition?: WhereParam, query?: QuerySchema) => Promise<Array<O>>;
}


export interface Table<O extends object> extends View<O> {
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
    
    update:{
        (conn, sql: string, param: any): Promise<O>,
        (conn, sql: string, param: any, returning: true): Promise<O>,
        (conn, sql: string, param: any, returning: false): Promise<Number>,
    }

    
    updateById:(id: number | string)=> Promise<number>
    updateByField:(field: string, value: string | number | boolean)=>Promise<number> ;
    updateByQuery:(query: QuerySchema)=>Promise<number> 
    updateByCondition:(condition: WhereParam)=> Promise<number> 
    
    deleteById:(id: number | string)=> Promise<number>
    deleteByField:(field: string, value: string | number | boolean)=>Promise<number> ;
    deleteByQuery:(query: QuerySchema)=>Promise<number> 
    deleteByCondition:(condition: WhereParam)=> Promise<number> 
    execute: {
        (conn, sql: string, param?: any): Promise<number>,
        (conn, sql: string, param: any, returning: false): Promise<number>,
        (conn, sql: string, param: any, returning: true): Promise<Array<O>>,
    },

}