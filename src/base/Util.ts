// pg 版本

import type { ClientBase } from 'pg';
import type { USchema } from './types';
import { Type } from '@sinclair/typebox';

type Settings = {
    provider?: () => ClientBase,
    pageSize?: number,
    /**
     * 所以错误直接 throw 出，如果需要自定义错误类型，可以在此传个 Error 子类
    */
    err?: typeof Error  ,
}

const GLOBAL: Settings = {
    provider: null,
    pageSize: 10,

    // err:Error,
    // mode: 'pg',
    // strict: true
}


export const getDB = (): ClientBase => {
    if (GLOBAL.provider == null) {
        throw new Error();
    }
    return GLOBAL.provider();

}

import type { TProperties, TPartial, TObject, StringOptions, StringFormatOption, DateOptions, NumericOptions } from '@sinclair/typebox';



type UStringOptions<Format extends string> = USchema &StringOptions<Format> &  {
    /**
     * The Funtion default call on this filed
    */
    fn?: 'lower' | 'upper'
}
type UNumericOptions = USchema & NumericOptions; 
type UDateOptions =USchema &  DateOptions  &  {
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



export const setup = (settings: Settings) => {
    if (settings.provider) {
        GLOBAL.provider = settings.provider;
    }
}

export const UType = {
    Table: <T extends TProperties>(properties: T): TPartial<TObject<T>> => Type.Partial(Type.Object(properties)),
    Number: (options?: UNumericOptions) => Type.Number(options),
    String: <Format extends string>(options?: UStringOptions<StringFormatOption | Format>) => Type.String(options),
    Date: (options?: UDateOptions) => Type.Date(options),
    Boolean: (options?: USchema) => Type.Boolean(options),
    Integer: (options?: UNumericOptions) => Type.Integer(options),
    // Required: Type.Required
}



