import type { USchema, MagicSuffix, DB_TYPE, UDateOptions, UNumericOptions, UStringOptions } from './types';
import type { TProperties, TPartial, TObject, StringFormatOption, TSchema } from '@sinclair/typebox';

import _ from 'lodash';
import dayjs from 'dayjs';
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { setProvider } from './Providers';

export const NONE_PARAM = new Set<MagicSuffix>(['IsNull', 'NotNull']);

export type Settings = {
    provider: [DB_TYPE, () => any] | (() => any),
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
    // date?: {
    //     // spify this to boost speed ,suggest aways iso 8601
    //     parseRuleFormat?: string,
    // }
}




var STRICT_QUERY = false;
var STRICT_ENTITY = false;
export var ShowSql = null;
export var PAGE_SIZE = 10;

export const setup = (settings: Settings) => {
    if (_.isArray(settings.provider)) {
        setProvider(settings.provider[0], settings.provider[1]);
    } else if (_.isFunction(settings.provider)) {
        setProvider('pg', settings.provider);
    }
    if (_.has(settings, 'strict')) {
        if (settings.strict) {
            if (_.isBoolean(settings.strict)) {
                STRICT_QUERY = true;
                STRICT_ENTITY = true;
            } else {
                if (settings.strict.entity) STRICT_ENTITY = true;
                if (settings.strict.query) STRICT_QUERY = true;
            }
        } else {
            STRICT_QUERY = false;
            STRICT_ENTITY = false;
        }
    }

    if (settings.pageSize) PAGE_SIZE = settings.pageSize;
    if (settings.showSQL && _.isFunction(settings.showSQL)) ShowSql = settings.showSQL;
}

export const UType = {
    Table: <T extends TProperties>(properties: T): TPartial<TObject<T>> => Type.Partial(Type.Object(properties)),
    Number: (options?: UNumericOptions) => Type.Number(options),
    String: <Format extends string>(options?: UStringOptions<StringFormatOption | Format>) => Type.String(options),
    Date: (options?: UDateOptions) => Type.Union([Type.Date(options), Type.Number(), Type.String()], options),
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


const getStart = (str: string): [MagicSuffix, string] => {
    if (str.startsWith('(')) return ['>', str.substring(1)];
    if (str.startsWith('[')) return ['>=', str.substring(1)];
    return ['>=', str]
}
const getEnd = (str: string): [MagicSuffix, string] => {
    if (str.endsWith(')')) return ['<', str.substring(0, str.length - 1)];
    if (str.endsWith(']')) return ['<=', str.substring(0, str.length - 1)];
    return ['<=', str]
}


const between = (txt: string): [MagicSuffix, string][] => {
    let str = _.trim((txt || ''));
    if (str.length == 0) return null;
    let ptns = str.split(',').map(_.trim);
    if (ptns.length > 2) return null;
    if (ptns.length == 1) return [getStart(ptns[0])];
    let result = [];
    if (ptns[0].length) result.push(getStart(ptns[0]));
    if (ptns[1].length) result.push(getEnd(ptns[1]));
    return result;
}

export const betweenNumber = (txt: string, parseFn): [MagicSuffix, number][] => {
    let range = between(txt);
    if (range == null) return null;
    let result = [];
    for (let item of range) {
        try {
            let num = parseFn(item[1]);
            result.push([item[0], num]);
        } catch {
            return null;
        }
    }
    return result;
}

export const betweenDate = (txt: string): [MagicSuffix, Date][] => {
    let range = between(txt);
    if (range == null) return null;
    let result = [];
    for (let item of range) {
        let day = dayjs(item[1])
        if (!day.isValid()) {
            return null;
        }
        result.push([item[0], day.toDate()]);
    }
    return result;
}

export const inString = (txt: string): string[] => {
    return txt.split(',').map(_.trim);
}
export const inNumber = (txt: string): number[] => {
    let result = [];
    txt.split(',').map(item => {
        try {
            result.push(parseInt(_.trim(item)));
        } catch {
        }
    })
    return result;
}




const BOOLEAN_TEXT_IGNORE = new Set(['', 'null']);
const BOOLEAN_TEXT_FALSE = new Set<any>(['0', 'false', '-1']);


export const boolValue = (value): boolean => {
    let bool = true;
    if (_.isString(value)) {
        let v = _.toLower(_.trim(value));
        if (BOOLEAN_TEXT_IGNORE.has(v)) return;
        if (BOOLEAN_TEXT_FALSE.has(v)) bool = false;
    } else {
        bool = !!value;
    }
    return bool;
}
