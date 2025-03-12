import _ from '../core/dash';

// import type { View, QueryBuilder } from '../core'
import type { OrderBy } from "./types";
// import type { TObject } from '@sinclair/typebox';



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
    throw new Error(message ? message : err[0], { cause: err.join('\n') as any })
}

