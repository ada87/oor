import { WhereItem, WhereCondition, QuerySchema, WhereDefine, FieldType, FieldFunction, SUFFIX, USchema, MagicSuffix } from './types';
import { Kind } from '@sinclair/typebox';
import { whereByCondition } from './QueryWhere';
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
const getFn = (type: FieldType, suffix: MagicSuffix, column: USchema, fn?: string): FieldFunction => {
    if (fn == null) {
        return null;
    }
    switch (type) {
        case 'string':
            // if(column.fn){
            //     if(column.fn=='lower'){

            //     }
            // } 


            break;
        case 'date':
            switch (suffix) {
                case 'MaxD':
                case 'MinD':
                    return 'd';
                case 'MaxH':
                case 'MinH':
                    return 'h';
                case 'MaxM':
                case 'MinM':
                    return 'm';
            }
            break;
        case 'boolean':
            break;
        case 'number':
            break;
    }

    return null;
}
/**
 * Cache Query Field To Where Filed
*/
const fieldToDef = (key: string, FIELD_MAP: Map<string, USchema>): WhereDefine => {
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
    const operType = getFieldType(SCHEMA);
    console.log(SCHEMA)
    let def: WhereDefine = { field: SCHEMA.column || query_field, type: operType, operation: '=' };
    if (SCHEMA.fn) {
        let fn = getFn(operType, suffix, FIELD_MAP.get(query_field), SCHEMA.fn);
        if (fn) {
            def.fn = fn;
        }
    }

    switch (suffix) {
        case 'Min':
            def.operation = '>';
            break;
        case 'Max':
            def.operation = '<';
            break;
        case 'MinD':
        case 'MinH':
        case 'MinM':
        case 'Mint':
            def.operation = '>=';
            break;
        case 'MaxD':
        case 'MaxH':
        case 'MaxM':
        case 'Maxt':
            def.operation = '<=';
            break;
        default:
            break;
        // return null;

    }
    return def;
}

const defineToItem = (def: WhereDefine, value: string | boolean | number | Date): WhereItem => {
    return { ...def, value };
}

const queryToCondition = (query: QuerySchema, FIELD_MAP: Map<string, USchema>, FIELD_CACHE: Map<string, WhereDefine>): WhereCondition => {
    const ROOT: WhereCondition = { link: 'AND', items: [] }
    _.keys(query).map(key => {
        if (FIELD_CACHE.has(key)) {
            const define = FIELD_CACHE.get(key);
            if (define == null) return;
            ROOT.items.push(defineToItem(define, query[key]));
            return;
        }
        if (DEFAULT_QUERY_KEY.has(key)) {
            FIELD_CACHE.set(key, null);
            return;
        };
        let define = fieldToDef(key, FIELD_MAP);
        FIELD_CACHE.set(key, define);
        if (define == null) return;
        ROOT.items.push(defineToItem(define, query[key]));

    })
    return ROOT;
}

/**
 * @see QuerySchema
 * Build Query Where By QuerySchema
*/
export const whereByQuery = (query: QuerySchema, FIELD_MAP: Map<string, USchema>, FIELD_CACHE: Map<string, WhereDefine>, startIdx = 1): [string, any[]] => {
    const condition = queryToCondition(query, FIELD_MAP, FIELD_CACHE);
    return whereByCondition(condition, startIdx)
}
