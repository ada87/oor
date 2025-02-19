import _ from 'lodash';
import dayjs from 'dayjs';
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

import type { Sort } from "./types";
import type { TObject } from '@sinclair/typebox';



const BY_SET = new Set<string>(['asc', 'desc']);

export const validateSort = (sort: Sort) => {
    if (sort == null) return false;
    if (sort.order == null || sort.by == null) return false;
    if (!BY_SET.has(sort.by)) return false;
    return true;
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
