import type { SchemaOptions } from '@sinclair/typebox';
/**
 * Where 判断条件
*/
export declare type WhereOperaction = '>' | '>=' | '<' | '<=' | '=' | 'LIKE' | 'NOT';
export declare type FieldType = 'string' | 'number' | 'boolean' | 'date';
export declare type FieldFunction = 'h' | 'd' | 'm' | 'floor' | 'ceil' | 'lower' | 'upper';
export declare type WhereDefine = {
    type?: FieldType;
    field: string;
    /**
     * 对比判断条件
    */
    operation: WhereOperaction;
    /**
     * 调用函数
     * h / d / m = Hour / Day  / Month  仅对日期类型有效
     * ceil / floor / 仅对 Number 有效
     * 'lower' / 'upper' = '小写' '大写' 仅对 String 有效
    */
    fn?: FieldFunction;
};
export declare type WhereItem = WhereDefine & {
    value: string | number | boolean | Date;
};
export declare type WhereCondition = {
    link: 'AND' | 'OR' | 'NOT';
    items: (WhereItem | WhereCondition)[];
};
export declare type MagicSuffix = 'Min' | 'Mint' | 'Max' | 'Maxt' | 'MinH' | 'MinD' | 'MinM' | 'MaxH' | 'MaxD' | 'MaxM' | 'Like' | 'Likel' | 'Liker';
export declare const SUFFIX: MagicSuffix[];
export declare type QuerySchema = {
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
    [props: string]: string | number | boolean | Date;
};
export declare type USchema = SchemaOptions & {
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
};
