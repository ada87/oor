import { WhereItem, WhereCondition, QuerySchema, WhereDefine, FieldType, SUFFIX, USchema, MagicSuffix } from './types';
import { Kind } from '@sinclair/typebox';
import { whereByCondition } from './QueryWhere';
import { STRICT } from './Util';
import _ from 'lodash';

const DEFAULT_QUERY_KEY = new Set<string>(['start_', 'count_', 'order_', 'by_', 'keyword_']);

export const getFieldType = (schema: any): FieldType => {
    switch (schema[Kind]) {
        case 'String':
            return 'string';
        case 'Number':
        case 'Integer':
            return 'number';
        case 'Boolean':
            return 'boolean';
        case 'Date':
            return 'date';
        default:
            return 'string';
    }
}

/**
 * Cache Query Field To Where Filed
*/
const fieldToDef = (key: string, FIELD_MAP: Map<string, USchema>): WhereDefine => {
    // console.log(key);
    // if (key == 'namea') {
    //     for (let [key, value] of FIELD_MAP) {
    //         console.log(key)
    //     }
    //     // console.log(FIELD_MAP)
    // }

    let SCHEMA = FIELD_MAP.get(key);
    let query_field = key, suffix: MagicSuffix = null;
    if (SCHEMA == null) {
        for (let fix of SUFFIX) {

            if (key.endsWith(fix)) {
                let temp = key.substring(0, key.length - fix.length);
                if (FIELD_MAP.has(temp)) {
                    query_field = temp;
                    SCHEMA = FIELD_MAP.get(temp)
                    suffix = fix;
                    break;
                }
            }
        }
    }

    if (SCHEMA == null) {
        return null;
    }
    // console.log(query_field, SCHEMA, suffix)
    const fieldType = getFieldType(SCHEMA);
    let def: WhereDefine = { property: query_field, field: SCHEMA.column || query_field, type: fieldType, condition: suffix };


    return def;
}

const defineToItem = (def: WhereDefine, schema: USchema, value: string | boolean | number | Date): WhereItem => {

    // console.log(def, schema)
    // switch(schema.ignore)
    // return null;
    return { ...def, value };

}

const queryToCondition = (query: QuerySchema, FIELD_MAP: Map<string, USchema>, FIELD_CACHE: Map<string, WhereDefine>): WhereCondition => {
    const err: string[] = [];
    const ROOT: WhereCondition = { link: 'AND', items: [] }
    _.keys(query).map(key => {
        let define: WhereDefine = null;
        if (FIELD_CACHE.has(key)) {
            define = FIELD_CACHE.get(key);
            if (define == null) return; // ignore default and error condition
        } else if (DEFAULT_QUERY_KEY.has(key)) {
            FIELD_CACHE.set(key, null);
            return;
        };
        if (define == null) {
            define = fieldToDef(key, FIELD_MAP);
        }
        FIELD_CACHE.set(key, define);
        if (define == null) {
            err.push(key)
            return
        };

        let queryItem = defineToItem(define, FIELD_MAP.get(define.property || define.field), query[key])
        if (queryItem == null) {
            err.push(key + ' \' value has problem : ' + String(query[key]))
            return;
        }
        ROOT.items.push(queryItem);
    });

    if (err.length) {
        if (STRICT) {
            throw new Error('Some SQL Error Occur', { cause: err })
        }
        console.log('----------Some Error of Query:--------')
        console.error('Query Field Not Validate [', err.join(' , '), ']');
        console.log('--------------------------------------')
    }
    return ROOT;
}

/**
 * @see QuerySchema
 * Build Query Where By QuerySchema
*/
export const whereByQuery = (query: QuerySchema, FIELD_MAP: Map<string, USchema>, FIELD_CACHE: Map<string, WhereDefine>, startIdx = 1): [string, any[]] => {
    const condition = queryToCondition(query, FIELD_MAP, FIELD_CACHE);
    return whereByCondition(condition, startIdx);
    // return whereByCondition(condition, startIdx)
}
