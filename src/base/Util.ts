import type { ClientBase } from 'pg';
import type { USchema } from './types';
import { Type } from '@sinclair/typebox';
import type { TProperties, TPartial, TObject, StringOptions, StringFormatOption, DateOptions, NumericOptions } from '@sinclair/typebox';

type Settings = {
    provider?: () => ClientBase,
    pageSize?: number,
    strict?: boolean,
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

var STRICT = false;
export var getDB = (): ClientBase => { throw new Error('Must specfy a DataBase provider') };
export var PAGE_SIZE = 10;

export const setup = (settings: Settings) => {
    if (settings.provider) getDB = settings.provider;
    if (settings.strict) STRICT = true;
    if (settings.pageSize) PAGE_SIZE = settings.pageSize;
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
    if (!STRICT) {
        console.error(message + '\n      ' + err.join('\n      '));
        return;
    }
    throw new Error(message ? message : err[0], { cause: err.join('\n') as any })
}

