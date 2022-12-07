import type { SchemaOptions } from '@sinclair/typebox';

export type DB_TYPE = 'pg' | 'es' | 'mysql';
/**
 * Where 判断条件
*/
export type FieldType = 'string' | 'number' | 'boolean' | 'date';

// https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-SIMILARTO-REGEXP

export const SUFFIX = [
    'Min', 'MinThan', 'Max', 'MaxThan',                 // commom  > , >= , <  ,  <=
    'MinH', 'MinD', 'MinM', 'MaxH', 'MaxD', 'MaxM',     // Only Date Hour / Day / Month
    'Like', 'Likel', 'Liker',                           // Only String  like leftlike rightlike
    'Bt', 'BtD', 'BtY', 'BtM',                          // BETWEEN, support Number/Date ,'BtY', 'BtM', 'BtD' Only  Spport Date
    'Not',                                              // != or <>
    'IsNull', 'NotNull',                                // isNull or Not NULL           This Suffix will avoid value
    'IsDistinct', 'NotDistinct',                        // isDistinct or Not Distinct   This Suffix will avoid value
    '>', '>=', '<', '<=', '=', '!=', '<>',              // Comparison Functions,  https://www.postgresql.org/docs/current/functions-comparison.html
    // 'In',                                            // Lower Perference ,  closed awhile
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
     * The Field Name in Entity Model.
    */
    // field?: string,
    /**
     * The comparison function.
    */
    fn?: MagicSuffix,
}

export type WhereItem = WhereDefine & {
    value: string | number | boolean | Date,
}

export type WhereCondition = {
    link: 'AND' | 'OR'
    // | 'NOT', // 去掉 Not  的支持
    items: (WhereItem | WhereCondition)[]
}

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
     * If specify total_ field, The Query will skip the count(total) query and return in total derectly.
     * do specify total_ in second can upper the performane in pagition query.
    */
    total_?: number;
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
    /**
     * Extend Query 
     * Use Maggic Suffix to build query condition
     * */
    [props: string]: string | number | boolean | Date
};



export type USchema = SchemaOptions & {
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
