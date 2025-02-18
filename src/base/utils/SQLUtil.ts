import _ from 'lodash';
import dayjs from 'dayjs';
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

import type { MagicSuffix, UDateOptions, UNumericOptions, UStringOptions, Column } from '../types';
import type { TProperties, TPartial, TObject } from '@sinclair/typebox';



export const NONE_PARAM = new Set<MagicSuffix>(['IsNull', 'NotNull']);



// var STRICT_QUERY = false;
// var STRICT_ENTITY = false;
// export var ShowSql = null;
// export var PAGE_SIZE = 10;


export const UType = {
    Table: <T extends TProperties>(properties: T): TPartial<TObject<T>> => Type.Partial(Type.Object(properties)),
    Number: (options?: UNumericOptions) => Type.Number(options),
    String: (options?: UStringOptions) => Type.String(options),
    Date: (options?: UDateOptions) => Type.Union([Type.Date(options), Type.Number(), Type.String()], options),
    Boolean: (options?: Column) => Type.Boolean(options),
    Integer: (options?: UNumericOptions) => Type.Integer(options),
}


export const throwErr = (strict: boolean, err: string[], message?: string) => {
    if (err.length == 0) return;
    if (!strict) {
        console.error(message + '\n      ' + err.join('\n      '));
        return;
    }
    throw new Error(message ? message : err[0], { cause: err.join('\n') as any })
}


export const checkEntity = (strict: boolean, T: TObject, val: any) => {
    if (!strict) {
        return;
    }
    const result = Value.Errors(T, val);
    let err = result.First();
    if (err) {

        throw new Error('Entity Has Some Error')
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
