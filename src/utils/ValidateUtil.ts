import _ from '../core/dash';
import { BaseError, ERROR_CODE } from '../core/BaseError';

import type { OrderBy } from "./types";



const BY_SET = new Set<string>(['asc', 'desc']);

export const validateSort = (sort: OrderBy, F2W?: Map<string, string>): OrderBy => {
    if (sort == null) return null;
    if (sort.order == null || sort.by == null) return null;
    if (!BY_SET.has(sort.by)) return null;
    if (F2W) {
        if (F2W.has(sort.order)) {
            return { order: F2W.get(sort.order), by: sort.by }
        }
        return null;
    }
    return sort;
}


export const throwErr = (strict: boolean, err: Array<string>, message?: string) => {
    if (err.length == 0) return;
    if (!strict) {
        console.warn(message + '\n      ' + err.join('\n      '));
        return;
    }
    throw new BaseError(ERROR_CODE.STRICT_CONDITION_ERROR, { message, cause: err.join('\n') as any })
}



export const parsePort = (value: string | number): number | false => {
    if (value == null) return false;
    let result = typeof value === 'number' ? value : parseInt(value);
    if (isNaN(result)) return false;
    if (result < 0 || result > 65535) return false;
    return result;
}