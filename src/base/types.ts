import { type SchemaOptions, type StringOptions, type DateOptions, type NumberOptions, Type } from '@sinclair/typebox';

export type DB_TYPE = 'pg' | 'es' | 'mysql' | 'sqlite';

export type Support = { string: boolean, number: boolean, date: boolean, boolean: boolean }
/**
 * Where 判断条件
*/
export type FieldType = 'string' | 'number' | 'int' | 'boolean' | 'date';

// https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-SIMILARTO-REGEXP

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
    items: (WhereItem | WhereCondition)[]
}

export type Sort = { order: string, by: 'asc' | 'desc' };

export type WhereParam = WhereCondition | (WhereCondition | WhereItem)[];

export type QuerySchema = {

    /**
     * The Start pos
     */
    start_?: number;
    /**
     * PageSize
     */
    count_?: number;
    /**
     * Not : Not Support yet!
    */
    keyword_?: string;
    /**
     * The Sort column field
     * default {modify_date} desc -> {key} desc -> Not sort
    */
    order_?: string;
    /**
     * The Sort column method
    */
    by_?: 'asc' | 'desc';
    // /**
    //  * If specify sid_ field, The Query will skip Steps:
    //  *      1. use last cached sql condition (exclude <start,count,order,by>)
    //  *      2. use last total (in pagition query).
    //  * do specify sid_ in second can upper the performane in pagition query.
    // */
    // sid_?: number;
    /**
     * If specify total_ field, The Query will skip the count(total) query and return in total derectly.
     * do specify total_ in second can upper the performane in pagition query.
    */
    total_?: number;
    /**
     * Extend Query 
     * Use Maggic Suffix to build query condition
     * */
    [props: string]: string | number | boolean | Date
};



export interface USchema extends SchemaOptions {
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



export interface UStringOptions extends USchema, StringOptions {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    delMark?: string;
}


export interface UNumericOptions extends USchema, NumberOptions {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    delMark?: number;
}



export interface UDateOptions extends USchema, DateOptions {
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
}