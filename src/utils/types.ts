import { Type } from '@sinclair/typebox';



import type {
    SchemaOptions, TProperties, TPartial,
    TObject, StringOptions, DateOptions, NumberOptions, IntegerOptions,
} from '@sinclair/typebox';

/**
 * For now , OOR is only support 5 types:
 * TODO : JSON, BIT
*/
export type FieldType = 'string' | 'double' | 'integer' | 'boolean' | 'date';
export type Support = Record<FieldType, boolean>;

export enum RETURN {
    SUCCESS,
    COUNT,
    INFO,
    KEY,
    ORIGIN,
}

/**
 * Field Suffix
*/
export const SUFFIX = [
    // 'Min', 'MinThan', 'Max', 'MaxThan',                 
    'Min', 'Max', ,                                         //  >=  ,  <=
    'More', 'MoreThan', 'Less', 'LessThan',                 //  > , >= , <  ,  <=
    'Gt', 'Gte', 'Lt', 'Lte',                               //  > , >= , <  ,  <=

    'MinH', 'MinD', 'MinM', 'MaxH', 'MaxD', 'MaxM',     // Only Date Hour / Day / Month
    'Like', 'Likel', 'Liker',                           // Only String  like leftlike rightlike
    'Bt', 'BtD', 'BtY', 'BtM',                          // BETWEEN, support Number/Date ,'BtY', 'BtM', 'BtD' Only  Spport Date
    'Not',                                              // != or <>
    'IsNull', 'NotNull',                                // isNull or Not NULL           This Suffix will avoid value
    // 'IsDistinct', 'NotDistinct',                        // isDistinct or Not Distinct   This Suffix will avoid value
    '>', '>=', '<', '<=', '=', '!=', '<>',              // Comparison Functions,  https://www.postgresql.org/docs/current/functions-comparison.html
    'In', 'NotIn'                                       // SQL IN Condition , use "," sperate items, Not support boolean date
] as const;

export type MagicSuffix = (typeof SUFFIX)[number];

export type DeleteMark = { column: string, value: string | number };

export type WhereDefine = {
    /**
     * Field Type.
    */
    type?: FieldType
    /**
     * The column Name in DB Table.
    */
    column: string,
    /**
     * The comparison function.
     * Use Magic Suffix!
    */
    fn?: MagicSuffix,
}
/**
 * The Row Key Type
*/
export type RowKeyType = string | number;
export type ByFieldType = RowKeyType | boolean; // not double / date

export type WhereItem = WhereDefine & {
    value: string | number | boolean | Date,
}

export type WhereCondition = {
    link: 'AND' | 'OR'
    items: Array<(WhereItem | WhereCondition)>
}



export type OrderBy = { order: string, by: 'asc' | 'desc' };
export type Limit = { start: number, count: number };
export type OrderByLimit = Limit | OrderBy & Limit;


export type WhereParam = WhereCondition | Array<(WhereCondition | WhereItem)>;

export type SQLStatement = [string, Array<any>];

export type QueryParam = Record<string, string | number | boolean | Date>
export type QueryOrderBy = {

    /**
     * The Start pos
     */
    _start?: number;
    /**
     * PageSize
     */
    _count?: number;
    /**
     * Not : Not Support yet!
    */
    _keyword?: string;
    /**
     * The Sort column field
     * default {modify_date} desc -> {key} desc -> Not sort
    */
    _order?: string;
    /**
     * The Sort column method
    */
    _by?: 'asc' | 'desc';
    /**
     * If specify cid_ field, The Query will skip Steps:
     *      1. use last cached sql condition (exclude <start,count,order,by>)
     *      2. use last total (in pagition query).
     * do specify sid_ in second can upper the performane in pagition query.
    */
    _cid?: number;
    /**
     * If specify total_ field, The Query will skip the count(total) query and return in total derectly.
     * do specify total_ in second can upper the performane in pagition query.
    */
    _total?: number;
    /**
     * Extend Query 
     * Use Maggic Suffix to build query Schema
     * */
};
export type QuerySchema = QueryParam & QueryOrderBy;



export interface Column extends SchemaOptions {
    /**
     * 1. if ignore = true , query SELECT will not include this field
     * 2. `table.getById()` will return this field. Actually `table.getById()` aways use SELECT * !
     * 3. default : false
    */
    ignore?: boolean;
    /**
    * please specify column name if table column name not math the model field name. 
    **/
    column?: string;


}



export interface UStringOptions extends Column, StringOptions {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    delMark?: string;
    /**
     * 常见的字符串处理函数
    */
    fn?: 'UPPER' | 'LOWER' | 'INITCAP' | 'TRIM' | 'LTRIM' | 'RTRIM' | 'REVERSE'

    /**
     * SUBSTRING,
     * REPLACE,
     * REVERSE,
     * 
    */
    // fnArgs?: Array<string | number>

    // | 'LENGTH' | 'SUBSTRING' | 'REPLACE' | 'REVERSE' | 'TO_HEX' | 'TO_BASE64' | 'TO_JSON' | 'TO_JSONB' | 'TO_ASCII' | 'TO_CHAR' | 'TO_DATE' | 'TO_TIMESTAMP' | 'TO_TIMESTAMP' | 'TO_NUMBER
}


export interface UNumericOptions extends Column, NumberOptions {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    // delMark?: number;

    fn?: 'ABS' | 'FLOOR' | 'CEIL' | 'ROUND' | 'SQRT'

    // agg?: 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'COUNT_DISTINCT'
}




export interface UDateOptions extends Column, DateOptions {
    /**
     * 1. Create Time can not be modify
     * 2. It will be auto fill with Current Time while INSERT
     * 3. default；: flase
    */
    isCreate?: boolean;
    /**
     * 1. Last Modify Time will be fill with Current Time while UPDATE
     * 2. default；: flase
    */
    isModify?: boolean;
    /**
     * 
    */
    // format?: string
}

export interface UStringOptions extends Column, StringOptions {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    delMark?: string;
}


export interface UIntegerOptions extends Column, IntegerOptions {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    delMark?: number;
}



export interface UDateOptions extends Column, DateOptions {
    /**
     * 1. Create Time can not be modify
     * 2. It will be auto fill with Current Time while INSERT
     * 3. default；: flase
    */
    isCreate?: boolean;
    /**
     * 1. Last Modify Time will be fill with Current Time while UPDATE
     * 2. default；: flase
    */
    isModify?: boolean;
    /**
     * 
    */
    format?: string
}

export const UType = {
    Table: <T extends TProperties>(properties: T): TObject<T> => Type.Object(properties),
    /**
     * Store Type : float / double
    */
    Double: (options?: UNumericOptions) => Type.Optional(Type.Number(options)),
    /**
     * Store Type : integer / long
    */
    Integer: (options?: UIntegerOptions) => Type.Optional(Type.Integer(options)),
    /**
     * Store Type : varchar / text /  string
    */
    String: (options?: UStringOptions) => Type.Optional(Type.String(options)),
    /**
     * Store Type : date
    */
    Date: (options?: UDateOptions) => Type.Optional(Type.Date(options)),
    /**
     * Store Type : varchar / string
    */
    DateString: (options?: UDateOptions) => Type.Optional(
        Type.Union(
            [
                Type.String(options),
                Type.Date({ ...options, }),
            ]
        )
    ),
    /**
     * Store Type : long / timestamp
    */
    DateLong: (options?: UDateOptions) => Type.Optional(
        Type.Union(
            [
                Type.Integer({ ...options, }),
                Type.Date({ ...options, }),
            ]
        )
    ),
    /**
     * Store Type : boolean
    */
    Boolean: (options?: Column) => Type.Optional(Type.Boolean(options)),
    /**
     * Store Type : bit / int (0 = false / 1 = true)
    */
    BooleanInteger: (options?: Column) => Type.Optional(Type.Integer(options)),

    /**
     * Store Type : float / double (not null)
    */
    DoubleRequired: (options?: UNumericOptions) => Type.Number(options),
    /**
     * Store Type : integer / long (not null)
    */
    IntegerRequired: (options?: UIntegerOptions) => Type.Integer(options),
    /**
     * Store Type : varchar / text /  string (not null)
    */
    StringRequired: (options?: UStringOptions) => Type.String(options),
    /**
     * Store Type : date (not null)
    */
    DateRequired: (options?: UDateOptions) => Type.Date(options),
    /**
     * Store Type : varchar / string (not null)
    */
    DateStringRequired: (options?: UDateOptions) => Type.Union(
        [
            Type.String(options),
            Type.Date({ ...options, }),
        ]
    ),
    /**
     * Store Type : long / timestamp (not null)
    */
    DateLongRequired: (options?: UDateOptions) => Type.Union(
        [
            Type.Integer({ ...options, }),
            Type.Date({ ...options, }),
        ]
    ),
    /**
     * Store Type : boolean (not null)
    */
    BooleanRequired: (options?: Column) => Type.Boolean(options),
    /**
     * Store Type : bit / int (0 = false / 1 = true) (not null)
    */
    BooleanIntegerRequired: (options?: Column) => Type.Optional(Type.Integer(options)),

}
