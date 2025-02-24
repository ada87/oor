import type { TObject } from '@sinclair/typebox';
import type {
    SQLStatement, WhereCondition, WhereItem, WhereParam,
    QuerySchema, OrderBy, Limit, OrderByLimit, QueryParam,
    RETURN, RowKeyType
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
    globalCondition?: QueryParam
    // | Array<WhereItem>;
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
    byId: (value: RowKeyType) => SQLStatement;

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

    whereId: (value: RowKeyType | object, startIdx?: number) => SQLStatement;

    insert: (data: object, ignoreNull?: boolean) => SQLStatement;
    update: (data: object, ignoreNull?: boolean) => SQLStatement;
    delete: () => SQLStatement;

    returning: (returnType: RETURN) => string
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
}





export interface ActionExecutor<C, O, R = any> extends QueryExecutor<C, O> {
    execute: (conn: C, SQL: string, PARAMS?: Array<any>) => Promise<R>

    convert: {
        (result: R, returnType?: RETURN): number;
        (result: R, returnType: RETURN.COUNT): number;
        (result: R, returnType: RETURN.SUCCESS): boolean;
        (result: R, returnType: RETURN.KEY): Partial<O>;
        (result: R, returnType: RETURN.INFO): O;
        (result: R, returnType: RETURN.ORIGIN): R;
    }
    convertBatch: {
        <T extends RETURN>(result: R, returnType?: T): T extends RETURN.COUNT ? number :
            T extends RETURN.SUCCESS ? boolean :
            T extends RETURN.KEY ? Array<Partial<O>> :
            T extends RETURN.INFO ? Array<O> :
            R;
    }



}




export interface View<O extends object = object> {

    all: (sort?: OrderBy) => Promise<Array<O>>;

    query: {
        (): Promise<Array<O>>
        (query: QuerySchema): Promise<Array<O>>,
    };
    queryPagination: (query?: QuerySchema) => Promise<{ total: number, list: Array<O> }>
    queryByField: (field: string, value: string | number | boolean, sort?: OrderBy) => Promise<Array<O>>;
    queryByWhere: (condition?: WhereParam, sort?: OrderByLimit) => Promise<Array<O>>;
    getById: (id: RowKeyType) => Promise<O>
    getByField: (field: string, value: string | number | boolean) => Promise<O>;
    getByWhere: (condition: WhereParam) => Promise<O>;

}


export interface Table<O extends object, R = any> extends View<O> {

    add: {
        (data: O): Promise<O>,
        (data: O, returnType: RETURN.SUCCESS): Promise<boolean>,
        (data: O, returnType: RETURN.COUNT): Promise<number>,
        (data: O, returnType: RETURN.INFO): Promise<O>,
        (data: O, returnType: RETURN.KEY): Promise<RowKeyType>,
        (data: O, returnType: RETURN.ORIGIN): Promise<any>,
    }
    // addBatch: {
    //     (data: Array<O>): Promise<number>,
    //     (data: Array<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (data: Array<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (data: Array<O>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },

    update: {
        (data: O): Promise<boolean>,
        (data: O, returnType: RETURN.SUCCESS, ignoreNull?: boolean): Promise<boolean>,
        (data: O, returnType: RETURN.COUNT, ignoreNull?: boolean): Promise<number>,
        (data: O, returnType: RETURN.INFO, ignoreNull?: boolean): Promise<O>,
        (data: O, returnType: RETURN.KEY, ignoreNull?: boolean): Promise<RowKeyType>,
        (data: O, returnType: RETURN.ORIGIN, ignoreNull?: boolean): Promise<R>,
    }

    // updateBatch: {
    //     (data: Array<Partial<O>>): Promise<number>,
    //     (data: Array<Partial<O>>, returnType?: RETURN.COUNT): Promise<number>,
    //     (data: Array<Partial<O>>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (data: Array<Partial<O>>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },

    // updateByField: {
    //     (field: string, value: string | number | boolean, data: Partial<O>): Promise<number>,
    //     (field: string, value: string | number | boolean, data: Partial<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (field: string, value: string | number | boolean, data: Partial<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (field: string, value: string | number | boolean, data: Partial<O>, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (field: string, value: string | number | boolean, data: Partial<O>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },

    // updateByQuery: {
    //     (query: QueryParam, data: Partial<O>): Promise<number>,
    //     (query: QueryParam, data: Partial<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (query: QueryParam, data: Partial<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (query: QueryParam, data: Partial<O>, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (query: QueryParam, data: Partial<O>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },

    // updateByWhere: {
    //     (condition: WhereParam, data: Partial<O>): Promise<number>,
    //     (condition: WhereParam, data: Partial<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },


    // truncate: () => Promise<boolean>;

    deleteById: {
        (id: RowKeyType | Partial<O>): Promise<boolean>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.COUNT): Promise<number>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.INFO): Promise<O>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.KEY): Promise<Partial<O>>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.ORIGIN): Promise<R>,
    }

    deleteByIds: {
        (id: Array<RowKeyType> | Array<Partial<O>>): Promise<number>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.SUCCESS): Promise<boolean>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.COUNT): Promise<number>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.INFO): Promise<Array<O>>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.KEY): Promise<Array<Partial<O>>>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.ORIGIN): Promise<R>,
    }


    deleteByField: {
        (field: string, value: string | number | boolean): Promise<number>,
        (field: string, value: string | number | boolean, returnType: RETURN.SUCCESS): Promise<boolean>,
        (field: string, value: string | number | boolean, returnType: RETURN.COUNT): Promise<number>,
        (field: string, value: string | number | boolean, returnType: RETURN.INFO): Promise<Array<O>>,
        (field: string, value: string | number | boolean, returnType: RETURN.KEY): Promise<Array<Partial<O>>>,
        (field: string, value: string | number | boolean, returnType: RETURN.ORIGIN): Promise<R>,
    },

    deleteByQuery: {
        (query: QueryParam): Promise<number>,
        (query: QueryParam, returnType: RETURN.SUCCESS): Promise<boolean>,
        (query: QueryParam, returnType: RETURN.COUNT): Promise<number>,
        (query: QueryParam, returnType: RETURN.INFO): Promise<Array<O>>,
        (query: QueryParam, returnType: RETURN.KEY): Promise<Array<Partial<O>>>,
        (query: QueryParam, returnType: RETURN.ORIGIN): Promise<R>,
    },

    deleteByWhere: {
        (where: WhereParam): Promise<number>,
        (where: WhereParam, returnType: RETURN.SUCCESS): Promise<boolean>,
        (where: WhereParam, returnType: RETURN.COUNT): Promise<number>,
        (where: WhereParam, returnType: RETURN.INFO): Promise<Array<O>>,
        (where: WhereParam, returnType: RETURN.KEY): Promise<Array<Partial<O>>>,
        (where: WhereParam, returnType: RETURN.ORIGIN): Promise<R>,
    },




}


export type QueryProvider<B extends QueryBuilder> = {
    new(tableName: string, schema: TObject, tbOptions?: TableOptions, dbOptions?: DatabaseOptions): B
};