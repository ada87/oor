import _ from 'lodash';
import { getFieldType } from './SQLUtil';
import { toDate } from './TimeUtil'
import { Value } from '@sinclair/typebox/value';

// import type { View, QueryBuilder } from '../core'
import type { Column, OrderBy } from "./types";
import type { TObject } from '@sinclair/typebox';



const BY_SET = new Set<string>(['asc', 'desc']);

export const validateSort = (sort: OrderBy, F2C?: Map<string, string>): OrderBy => {
    if (sort == null) return null;
    if (sort.order == null || sort.by == null) return null;
    if (!BY_SET.has(sort.by)) return null;
    if (F2C) {
        if (F2C.has(sort.order)) {
            return { order: F2C.get(sort.order), by: sort.by }
        }
        return null;
    }
    return sort;
}


export const throwErr = (strict: boolean, err: string[], message?: string) => {
    if (err.length == 0) return;
    if (!strict) {
        console.error(message + '\n      ' + err.join('\n      '));
        return;
    }
    throw new Error(message ? message : err[0], { cause: err.join('\n') as any })
}



/**
 * Auto convert data
 * check row data while insert or update
 * */
export const checkEntity = <T extends object = object>(
    obj: T,
    SCHEMA: TObject,
    COLUMN_MAP: Map<string, Column>,
    isAdd: boolean = false,
    strict: boolean = false,
): T => {
    let clone: any = {}
    for (let [key, schema] of COLUMN_MAP) {
        let field = schema.column || key;
        if (_.has(obj, key)) clone[field] = obj[key];
        let type = getFieldType(schema);
        if (type == 'date') {
            if (schema.isCreate) {
                if (isAdd) {
                    clone[field] = new Date();
                } else {
                    _.unset(clone, field);
                }
                return;
            }
            if (schema.isModify) {
                clone[field] = new Date();
                return;
            }
            if (obj[key] === null || obj[key] === 0) {
                clone[field] = null;
            } else {
                clone[field] = toDate(obj[key]);
            }
        }
    }

    if (strict) {
        const result = Value.Errors(SCHEMA, clone);
        let err = result.First();
        if (err) {
            throw new Error('Entity Has Some Error')
        }
    }
    return clone;
}
