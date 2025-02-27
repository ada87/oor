import type { TObject } from '@sinclair/typebox';
import type {
    SQLStatement, WhereCondition, WhereParam,
    QuerySchema, OrderBy, OrderByLimit, QueryParam,
    RETURN, RowKeyType, ByFieldType
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




export type QueryProvider<B extends QueryBuilder> = {
    new(tableName: string, schema: TObject, tbOptions?: TableOptions, dbOptions?: DatabaseOptions): B
};

export interface Database<C, Options extends DatabaseOptions = DatabaseOptions> {
    getConn: () => Promise<C>;
    getOption: () => Options;
}

export type QueryOptions = {
    /**
     * if true , will ignore global condition 
    */
    ignoreGlobalCondition?: boolean
}
export type InsertOptions = {
    /**
     * if true , will ignore id clolumn in INSERT
     * DEFAULT (CHECK ROW_KEY IS NUMBER)
    */
    isAutoIncrement?: boolean,
    /**
     * if ture , `{ age: null }` will be ignored
    */
    ignoreNull?: boolean,
    /**
     * if ture , `{ name: "" }` will be ignored
    */
    ignoreEmptyString?: boolean,
}

export type UpdateOptions = QueryOptions & InsertOptions;

export type DatabaseOptions = {
    /**
     * Global Row key , will detect "id" / "uuid" / "guid" and rowkey
    */
    rowKey?: string
    /**
     * Global default PageSize in query default 20
    */
    pageSize?: number
    /**
     * Some error ocur in The WHERE clause.
     *      eg. column not exists,  number use string funcion, and more error .
     *      eg. { not_exist_column: 'abc' } , { age: 'abc' } 
     * true : Error Parse query will throw errors 
     * flase : will ignore error query condition
    */
    strictQuery?: boolean
    /**
     * Some error ocur in The UPDATE / INSERT clause.
     * true : Error Parse sql will throw errors 
     * flase : will ignore error value
    */
    strictEntity?: boolean
    /**
     * protect Query from NOT LIMIT
    */
    maxCount?: number
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

    whereId: (value: RowKeyType | object, startIdx: number) => SQLStatement;
    insert: (data: object | Array<object>, options?: InsertOptions) => SQLStatement;
    update: (data: object, options?: UpdateOptions) => SQLStatement;
    delete: (options?: QueryOptions) => SQLStatement;

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

    // truncate: () => Promise<boolean>;
    insert: {
        (data: O): Promise<O>,
        (data: O, returnType: RETURN.SUCCESS, options?: InsertOptions): Promise<boolean>,
        (data: O, returnType: RETURN.COUNT, options?: InsertOptions): Promise<number>,
        (data: O, returnType: RETURN.INFO, options?: InsertOptions): Promise<O>,
        (data: O, returnType: RETURN.KEY, options?: InsertOptions): Promise<RowKeyType>,
        (data: O, returnType: RETURN.ORIGIN, options?: InsertOptions): Promise<any>,
    }

    insertBatch: {
        (data: Array<O>): Promise<number>,
        (data: Array<O>, returnType: RETURN.SUCCESS, options?: InsertOptions): Promise<boolean>,
        (data: Array<O>, returnType: RETURN.COUNT, options?: InsertOptions): Promise<number>,
        (data: Array<O>, returnType: RETURN.INFO, options?: InsertOptions): Promise<Array<O>>,
        (data: Array<O>, returnType: RETURN.KEY, options?: InsertOptions): Promise<Array<Partial<O>>>,
        (data: Array<O>, returnType: RETURN.ORIGIN, options?: InsertOptions): Promise<any>,
    },

    update: {
        (data: O): Promise<boolean>,
        (data: O, returnType: RETURN.SUCCESS, options?: UpdateOptions): Promise<boolean>,
        (data: O, returnType: RETURN.COUNT, options?: UpdateOptions): Promise<number>,
        (data: O, returnType: RETURN.INFO, options?: UpdateOptions): Promise<O>,
        (data: O, returnType: RETURN.KEY, options?: UpdateOptions): Promise<RowKeyType>,
        (data: O, returnType: RETURN.ORIGIN, options?: UpdateOptions): Promise<R>,
    }


    // updateByField: {
    //     (data:Partial<O>, field: string, value: string | number | boolean): Promise<number>,
    //     (data:Partial<O>, field: string, value: string | number | boolean, returnType?: RETURN.COUNT): Promise<number>,
    //     (data:Partial<O>, field: string, value: string | number | boolean, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (data:Partial<O>, field: string, value: string | number | boolean, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (data:Partial<O>, field: string, value: string | number | boolean, returnType: RETURN.INFO): Promise<Array<O>>,
    // },

    // updateByQuery: {
    //     (data:Partial<O>, query: QueryParam): Promise<number>,
    //     (data:Partial<O>, query: QueryParam, returnType?: RETURN.COUNT): Promise<number>,
    //     (data:Partial<O>, query: QueryParam, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (data:Partial<O>, query: QueryParam, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (data:Partial<O>, query: QueryParam, returnType: RETURN.INFO): Promise<Array<O>>,
    // },

    // updateByWhere: {
    //     (data:Partial<O>, condition: WhereParam): Promise<number>,
    //     (data:Partial<O>, condition: WhereParam, returnType?: RETURN.COUNT): Promise<number>,
    //     (data:Partial<O>, condition: WhereParam, returnType: RETURN.SUCCESS): Promise<boolean>,
    //     (data:Partial<O>, condition: WhereParam, returnType: RETURN.OBJECT_ID): Promise<Array<number | string>>,
    //     (data:Partial<O>, condition: WhereParam, returnType: RETURN.INFO): Promise<Array<O>>,
    // },



    deleteById: {
        (id: RowKeyType | Partial<O>): Promise<boolean>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.SUCCESS, options?: QueryOptions): Promise<boolean>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.COUNT, options?: QueryOptions): Promise<number>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.INFO, options?: QueryOptions): Promise<O>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.KEY, options?: QueryOptions): Promise<Partial<O>>,
        (id: RowKeyType | Partial<O>, returnType: RETURN.ORIGIN, options?: QueryOptions): Promise<R>,
    }

    deleteByIds: {
        (id: Array<RowKeyType> | Array<Partial<O>>): Promise<number>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.SUCCESS, options?: QueryOptions): Promise<boolean>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.COUNT, options?: QueryOptions): Promise<number>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.INFO, options?: QueryOptions): Promise<Array<O>>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.KEY, options?: QueryOptions): Promise<Array<Partial<O>>>,
        (id: Array<RowKeyType> | Array<Partial<O>>, returnType: RETURN.ORIGIN, options?: QueryOptions): Promise<R>,
    }

    deleteByField: {
        (field: string, value: ByFieldType): Promise<number>,
        (field: string, value: ByFieldType, returnType: RETURN.SUCCESS, options?: QueryOptions): Promise<boolean>,
        (field: string, value: ByFieldType, returnType: RETURN.COUNT, options?: QueryOptions): Promise<number>,
        (field: string, value: ByFieldType, returnType: RETURN.INFO, options?: QueryOptions): Promise<Array<O>>,
        (field: string, value: ByFieldType, returnType: RETURN.KEY, options?: QueryOptions): Promise<Array<Partial<O>>>,
        (field: string, value: ByFieldType, returnType: RETURN.ORIGIN, options?: QueryOptions): Promise<R>,
    },

    deleteByQuery: {
        (query: QueryParam): Promise<number>,
        (query: QueryParam, returnType: RETURN.SUCCESS, options?: QueryOptions): Promise<boolean>,
        (query: QueryParam, returnType: RETURN.COUNT, options?: QueryOptions): Promise<number>,
        (query: QueryParam, returnType: RETURN.INFO, options?: QueryOptions): Promise<Array<O>>,
        (query: QueryParam, returnType: RETURN.KEY, options?: QueryOptions): Promise<Array<Partial<O>>>,
        (query: QueryParam, returnType: RETURN.ORIGIN, options?: QueryOptions): Promise<R>,
    },

    deleteByWhere: {
        (where: WhereParam): Promise<number>,
        (where: WhereParam, returnType: RETURN.SUCCESS, options?: QueryOptions): Promise<boolean>,
        (where: WhereParam, returnType: RETURN.COUNT, options?: QueryOptions): Promise<number>,
        (where: WhereParam, returnType: RETURN.INFO, options?: QueryOptions): Promise<Array<O>>,
        (where: WhereParam, returnType: RETURN.KEY, options?: QueryOptions): Promise<Array<Partial<O>>>,
        (where: WhereParam, returnType: RETURN.ORIGIN, options?: QueryOptions): Promise<R>,
    },




}
