import { Type } from '@sinclair/typebox';

import type {
    SchemaOptions, TProperties, TPartial,
    TObject, StringOptions, DateOptions, NumberOptions,
} from '@sinclair/typebox';

// https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-SIMILARTO-REGEXP
/**
 * Where 判断条件
*/
export type FieldType = 'string' | 'number' | 'int' | 'boolean' | 'date';
export type Support = Record<FieldType, boolean>;



export const SUFFIX = [
    'Min', 'MinThan', 'Max', 'MaxThan',                 // commom  > , >= , <  ,  <=
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

export type DeleteMark = { field: string, value: string | number | boolean, };

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

export type QuerySchema = {

    /**
     * The Start pos
     */
    _start_?: number;
    /**
     * PageSize
     */
    _count_?: number;
    /**
     * Not : Not Support yet!
    */
    _keyword_?: string;
    /**
     * The Sort column field
     * default {modify_date} desc -> {key} desc -> Not sort
    */
    _order_?: string;
    /**
     * The Sort column method
    */
    _by_?: 'asc' | 'desc';
    /**
     * If specify cid_ field, The Query will skip Steps:
     *      1. use last cached sql condition (exclude <start,count,order,by>)
     *      2. use last total (in pagition query).
     * do specify sid_ in second can upper the performane in pagition query.
    */
    _cid_?: number;
    /**
     * If specify total_ field, The Query will skip the count(total) query and return in total derectly.
     * do specify total_ in second can upper the performane in pagition query.
    */
    _total_?: number;
    /**
     * Extend Query 
     * Use Maggic Suffix to build query condition
     * */
    [props: string]: string | number | boolean | Date
};



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
    /**
     * TODO The Funtion default call on this filed
    */
    // fn?: 'lower' | 'upper'


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


export interface UNumericOptions extends Column, NumberOptions {
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

export interface UStringOptions extends Column, StringOptions {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    delMark?: string;
}


export interface UNumericOptions extends Column, NumberOptions {
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

    Number: (options?: UNumericOptions) => Type.Optional(Type.Number(options)),
    String: (options?: UStringOptions) => Type.Optional(Type.String(options)),

    Date: (options?: UDateOptions) => Type.Optional(Type.Date(options)),
    DateString: (options?: UDateOptions) => Type.Optional(Type.String(options)),
    DateNumber: (options?: UDateOptions) => Type.Optional(Type.Number(options)),

    Boolean: (options?: Column) => Type.Optional(Type.Boolean(options)),
    Integer: (options?: UNumericOptions) => Type.Optional(Type.Integer(options)),

    NumberRequired: (options?: UNumericOptions) => Type.Number(options),
    StringRequired: (options?: UStringOptions) => Type.String(options),
    // DateRequired: (options?: UDateOptions) => Type.Union([Type.Date(options), Type.Number(), Type.String()], options),
    DateRequired: (options?: UDateOptions) => Type.Optional(Type.Date(options)),
    DateStringRequired: (options?: UDateOptions) => Type.Optional(Type.String(options)),
    DateNumberRequired: (options?: UDateOptions) => Type.Optional(Type.Number(options)),


    BooleanRequired: (options?: Column) => Type.Boolean(options),
    IntegerRequired: (options?: UNumericOptions) => Type.Integer(options),

}
