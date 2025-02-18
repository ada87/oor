import type { WhereParam, WhereItem, QuerySchema, Sort } from './utils/types'

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

// type DateType = Date | string | number | null | undefined;

export type DatabaseOptions = {
    pageSize?: number
    rowKey?: string
    strictQuery?: boolean
    strictEntity?: boolean
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

export interface Database<C, Options extends DatabaseOptions = DatabaseOptions> {
    getConn: () => Promise<C>;
    getOptions: () => Options;
}

export interface View<O extends object> {
    // readonly tableName: string;

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
    readonly tableName: string;
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



export { BaseView } from './BaseView'
// export { BaseTable } from './BaseTable'