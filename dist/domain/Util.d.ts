import type { ClientBase } from 'pg';
import type { USchema } from './types';
declare type Settings = {
    provider?: () => ClientBase;
    pageSize?: number;
    /**
     * 所以错误直接 throw 出，如果需要自定义错误类型，可以在此传个 Error 子类
    */
    err?: typeof Error;
};
export declare const getDB: () => ClientBase;
import type { TProperties, TPartial, TObject, StringOptions, StringFormatOption, DateOptions, NumericOptions } from '@sinclair/typebox';
declare type UStringOptions<Format extends string> = USchema & StringOptions<Format> & {
    /**
     * The Funtion default call on this filed
    */
    fn?: 'lower' | 'upper';
};
declare type UNumericOptions = USchema & NumericOptions;
declare type UDateOptions = USchema & DateOptions & {
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
};
export declare const setup: (settings: Settings) => void;
export declare const UType: {
    Table: <T extends TProperties>(properties: T) => TPartial<TObject<T>>;
    Number: (options?: UNumericOptions) => import("@sinclair/typebox").TNumber;
    String: <Format extends string>(options?: UStringOptions<StringFormatOption | Format>) => import("@sinclair/typebox").TString<Format>;
    Date: (options?: UDateOptions) => import("@sinclair/typebox").TDate;
    Boolean: (options?: USchema) => import("@sinclair/typebox").TBoolean;
    Integer: (options?: UNumericOptions) => import("@sinclair/typebox").TInteger;
};
export {};
