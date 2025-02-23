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
    insert: (data: object) => SQLStatement;
    update: (data: object) => SQLStatement;
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
    queryByCondition: (condition?: WhereParam, sort?: OrderByLimit) => Promise<Array<O>>;

    getById: (id: RowKeyType) => Promise<O>
    getByField: (field: string, value: string | number | boolean) => Promise<O>;
    getByCondition: (condition: WhereParam) => Promise<O>;

}


export interface Table<O extends object, R = any> extends View<O> {

    add: {
        (data: O): Promise<boolean>,
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
        (data: O, returnType: RETURN.SUCCESS): Promise<boolean>,
        (data: O, returnType: RETURN.COUNT): Promise<number>,
        (data: O, returnType: RETURN.INFO): Promise<O>,
        (data: O, returnType: RETURN.KEY): Promise<RowKeyType>,
        (data: O, returnType: RETURN.ORIGIN): Promise<R>,
    }

    // updateById: {
    //     (id: RowKeyType, data: Partial<O>): Promise<boolean>,
    //     (id: RowKeyType, data: Partial<O>, returnType?: RETURN.SUCCESS): Promise<boolean>,
    //     (id: RowKeyType, data: Partial<O>, returnType: RETURN.INFO): Promise<O>,
    // }
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

    // updateByCondition: {
    //     (condition: WhereParam, data: Partial<O>): Promise<number>,
    //     (condition: WhereParam, data: Partial<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },


    // // truncate: () => Promise<boolean>;

    // deleteById: {
    //     (id: RowKeyType, data: Partial<O>): Promise<boolean>,
    //     (id: RowKeyType, data: Partial<O>, returnType?: RETURN.SUCCESS): Promise<boolean>,
    //     (id: RowKeyType, data: Partial<O>, returnType: RETURN.INFO): Promise<O>,
    // }


    // deleteByIds: {
    //     (id: RowKeyType | Array<RowKeyType>, data: Partial<O>): Promise<number>,
    //     (id: RowKeyType | Array<RowKeyType>, data: Partial<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (id: RowKeyType | Array<RowKeyType>, data: Partial<O>, returnType?: RETURN.SUCCESS): Promise<boolean>,
    //     (id: RowKeyType | Array<RowKeyType>, data: Partial<O>, returnType: RETURN.INFO): Promise<O>,
    // }
    // deleteByField: {
    //     (field: string, value: string | number | boolean, data: Partial<O>): Promise<number>,
    //     (field: string, value: string | number | boolean, data: Partial<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (field: string, value: string | number | boolean, data: Partial<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (field: string, value: string | number | boolean, data: Partial<O>, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (field: string, value: string | number | boolean, data: Partial<O>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },

    // deleteByQuery: {
    //     (query: QueryParam, data: Partial<O>): Promise<number>,
    //     (query: QueryParam, data: Partial<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (query: QueryParam, data: Partial<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (query: QueryParam, data: Partial<O>, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (query: QueryParam, data: Partial<O>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },

    // deleteByCondition: {
    //     (condition: WhereParam, data: Partial<O>): Promise<number>,
    //     (condition: WhereParam, data: Partial<O>, returnType?: RETURN.COUNT): Promise<number>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (condition: WhereParam, data: Partial<O>, returnType: RETURN.INFO): Promise<Array<O>>,
    // },




}


export type QueryProvider<B extends QueryBuilder> = {
    new(tableName: string, schema: TObject, tbOptions?: TableOptions, dbOptions?: DatabaseOptions): B
};