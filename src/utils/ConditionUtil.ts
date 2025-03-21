import _ from '../core/dash';
import { TSchema } from '@sinclair/typebox';
import { getFieldType } from './SQLUtil';
import { WhereCondition, QuerySchema, WhereDefine, SUFFIX, MagicSuffix } from './types';
import { throwErr } from './ValidateUtil';
import { colorFieldName } from './color';


const DEFAULT_QUERY_KEY = new Set<string>(['_start', '_count', '_order', '_by', '_keyword', '_cid', '_total']);


/**
 * Cache Query Field To Where Filed
*/
const fieldToDef = (key: string, COLUMN_MAP: Map<string, TSchema>): WhereDefine => {
    let SCHEMA = COLUMN_MAP.get(key);
    let query_field = key, suffix: MagicSuffix = null;
    if (SCHEMA == null) {
        for (let fix of SUFFIX) {

            if (key.endsWith(fix)) {
                let temp = key.substring(0, key.length - fix.length);
                if (COLUMN_MAP.has(temp)) {
                    query_field = temp;
                    SCHEMA = COLUMN_MAP.get(temp)
                    suffix = fix;
                    break;
                }
            }
        }
    }

    if (SCHEMA == null) {
        return null;
    }
    const fieldType = getFieldType(SCHEMA);
    let def: WhereDefine = { column: SCHEMA.column || query_field, type: fieldType, fn: suffix };

    return def;
}

// const defineToItem = (def: WhereDefine, schema: TSchema, value: string | boolean | number | Date): WhereItem => {
//     // TODO : IGNORE SOME INVALIDATE SCHEMA
//     // console.log(schema)
//     // return null;
//     return { ...def, value };

// }

export const queryToCondition = (strict: boolean, query: QuerySchema, COLUMN_MAP: Map<string, TSchema>, FIELD_CACHE: Map<string, WhereDefine>): WhereCondition => {
    const err: string[] = [];
    const ROOT: WhereCondition = { link: 'AND', items: [] }


    _.keys(query).map(key => {
        let define: WhereDefine = null;
        // console.log(key)
        if (FIELD_CACHE.has(key)) {
            define = FIELD_CACHE.get(key);
            // if (define == null) return; // ignore default and error
        } else if (DEFAULT_QUERY_KEY.has(key)) {
            // FIELD_CACHE.set(key, null);
            return;
        };
        if (define == null) {
            define = fieldToDef(key, COLUMN_MAP);
            FIELD_CACHE.set(key, define);
        }
        if (define == null) {
            err.push(`${colorFieldName(key)} not existed`)
            return
        };
        // let queryItem = defineToItem(define, COLUMN_MAP.get(define.column), query[key])
        // if (queryItem == null) {
        //     err.push(key + ' \' value has problem : ' + String(query[key]))
        //     return;
        // }
        ROOT.items.push({ ...define, value: query[key] });
    });
    // console.error(err)

    // let keyword = _.trim(query._keyword_);
    // if (keyword) {
    //     let OR: WhereCondition = { link: 'OR', items: [] }
    //     for (let [key, value] of COLUMN_MAP) {
    //         if (value.ignore) continue;
    //         let type = getFieldType(value);
    //         if (type != 'string') continue;
    //         OR.items.push({ column: value.column || key, value: keyword, fn: 'Like' });
    //     }
    //     if (OR.items.length) {
    //         if (OR.items.length == 1) {
    //             ROOT.items.push(OR.items[0])
    //         } else { 
    //             ROOT.items.push(OR)
    //         }
    //     }
    // }

    throwErr(strict, err, 'Some Fields not existed in schema' + (strict ? ' Will be ignore' : ''))
    return ROOT;
}