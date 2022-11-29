"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whereByQuery = exports.getFieldType = void 0;
const types_1 = require("./types");
const typebox_1 = require("@sinclair/typebox");
const QueryWhere_1 = require("./QueryWhere");
const lodash_1 = __importDefault(require("lodash"));
const DEFAULT_QUERY_KEY = new Set(['start_', 'count_', 'order_', 'by_', 'keyword_']);
const getFieldType = (schema) => {
    switch (schema[typebox_1.Kind]) {
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
};
exports.getFieldType = getFieldType;
const getFn = (type, suffix, column, fn) => {
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
};
/**
 * Cache Query Field To Where Filed
*/
const fieldToDef = (key, FIELD_MAP) => {
    let SCHEMA = FIELD_MAP.get(key);
    let query_field = key, suffix = null;
    if (SCHEMA == null) {
        for (let fix of types_1.SUFFIX) {
            if (key.endsWith(fix)) {
                let temp = key.substring(0, key.length - fix.length);
                if (FIELD_MAP.has(temp)) {
                    query_field = temp;
                    SCHEMA = FIELD_MAP.get(temp);
                    suffix = fix;
                    break;
                }
            }
        }
    }
    if (SCHEMA == null) {
        return null;
    }
    const operType = (0, exports.getFieldType)(SCHEMA);
    console.log(SCHEMA);
    let def = { field: SCHEMA.column || query_field, type: operType, operation: '=' };
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
};
const defineToItem = (def, value) => {
    return Object.assign(Object.assign({}, def), { value });
};
const queryToCondition = (query, FIELD_MAP, FIELD_CACHE) => {
    const ROOT = { link: 'AND', items: [] };
    lodash_1.default.keys(query).map(key => {
        if (FIELD_CACHE.has(key)) {
            const define = FIELD_CACHE.get(key);
            if (define == null)
                return;
            ROOT.items.push(defineToItem(define, query[key]));
            return;
        }
        if (DEFAULT_QUERY_KEY.has(key)) {
            FIELD_CACHE.set(key, null);
            return;
        }
        ;
        let define = fieldToDef(key, FIELD_MAP);
        FIELD_CACHE.set(key, define);
        if (define == null)
            return;
        ROOT.items.push(defineToItem(define, query[key]));
    });
    return ROOT;
};
/**
 * @see QuerySchema
 * Build Query Where By QuerySchema
*/
const whereByQuery = (query, FIELD_MAP, FIELD_CACHE, startIdx = 1) => {
    const condition = queryToCondition(query, FIELD_MAP, FIELD_CACHE);
    return (0, QueryWhere_1.whereByCondition)(condition, startIdx);
};
exports.whereByQuery = whereByQuery;
