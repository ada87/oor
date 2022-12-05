import type { ClientBase, Pool } from 'pg';
import _ from 'lodash';
import type { USchema, FieldType, MagicSuffix } from './types';
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import type { TProperties, TPartial, TObject, StringOptions, StringFormatOption, DateOptions, NumericOptions } from '@sinclair/typebox';



const SUPPORT_MAP = new Map<FieldType, Set<MagicSuffix>>([
    ['string', new Set<MagicSuffix>(['Min', 'MinThan', 'Max', 'MaxThan', 'Like', 'Likel', 'Liker', 'Not', 'IsNull', 'NotNull', 'IsDistinct', 'NotDistinct', '>', '>=', '<', '<=', '=', '!=', '<>'])],
    ['number', new Set<MagicSuffix>(['Min', 'MinThan', 'Max', 'MaxThan', 'Bt', 'Not', 'IsNull', 'NotNull', 'IsDistinct', 'NotDistinct', '>', '>=', '<', '<=', '=', '!=', '<>'])],
    ['boolean', new Set<MagicSuffix>(['Min', 'Max', 'Not', 'IsNull', 'NotNull', '>', '<', '=', '!=', '<>'])],
    ['date', new Set<MagicSuffix>(['Min', 'MinThan', 'Max', 'MaxThan', 'MinH', 'MinD', 'MinM', 'MaxH', 'MaxD', 'MaxM', 'Bt', 'BtD', 'BtY', 'BtM', 'Not', 'IsNull', 'NotNull', '>', '>=', '<', '<=', '=', '!=', '<>'])],
]);

export const isSupport = (type: FieldType, suffix: MagicSuffix) => {
    let set = SUPPORT_MAP.has(type) ? SUPPORT_MAP.get(type) : SUPPORT_MAP.get('string');
    return set.has(suffix);
}
export const NONE_PARAM = new Set<MagicSuffix>(['IsNull', 'NotNull', 'IsDistinct', 'NotDistinct']);

export type Settings = {
    provider: () => ClientBase | Pool,
    pageSize?: number,
    /**
     * A log Function Example : default :null
     *      console.info
     *      logger.log
     */
    showSQL?: Function;
    strict?: boolean | {
        query?: boolean
        entity?: boolean,
    },
}



type UStringOptions<Format extends string> = USchema & StringOptions<Format> & {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    delMark?: string;
}
type UNumericOptions = USchema & {
    /**
     * Defind a mark: 
     *      1. Delete action will update this filed to mark 
     *      2. Query  action will add conditon with != ${delMark}
     *      3. Note : A table can only hava ONE delMark.
    */
    delMark?: number;
} & NumericOptions;
type UDateOptions = USchema & DateOptions & {
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

var STRICT_QUERY = false;
var STRICT_ENTITY = false;
export var ShowSql = (str, param?: any) => { }

export var getDB = (): (ClientBase | Pool) => { throw new Error('Must specfy a DataBase provider') };
export var PAGE_SIZE = 10;

export const setup = (settings: Settings) => {
    if (settings.provider) getDB = settings.provider;
    // if (settings.strict) STRICT = true;
    if (settings.strict) {
        if (_.isBoolean(settings.strict)) {
            STRICT_QUERY = true;
            STRICT_ENTITY = true;
        } else {
            if (settings.strict.entity) STRICT_ENTITY = true;
            if (settings.strict.query) STRICT_QUERY = true;
        }
    }
    if (settings.pageSize) PAGE_SIZE = settings.pageSize;
    if (settings.showSQL && _.isFunction(settings.showSQL)) ShowSql = settings.showSQL;
}

export const UType = {
    Table: <T extends TProperties>(properties: T): TPartial<TObject<T>> => Type.Partial(Type.Object(properties)),
    Number: (options?: UNumericOptions) => Type.Number(options),
    String: <Format extends string>(options?: UStringOptions<StringFormatOption | Format>) => Type.String(options),
    Date: (options?: UDateOptions) => Type.Date(options),
    Boolean: (options?: USchema) => Type.Boolean(options),
    Integer: (options?: UNumericOptions) => Type.Integer(options),
}

export const throwErr = (err: string[], message?: string) => {
    if (err.length == 0) return;
    if (!STRICT_QUERY) {
        console.error(message + '\n      ' + err.join('\n      '));
        return;
    }
    throw new Error(message ? message : err[0], { cause: err.join('\n') as any })
}


export const checkEntity = (T: TObject, val: any) => {
    if (!STRICT_ENTITY) {
        return;
    }
    const result = Value.Errors(T, val);
    let err = result.next();
    if (err) {
        throw new Error('Entity Has Some value')
    }

}