import _ from './dash';
import { validateSort } from '../utils/ValidateUtil';
import { getFieldType } from '../utils/SQLUtil';
import { queryToCondition } from '../utils/ConditionUtil';

import type { DatabaseOptions, TableOptions } from './types'
import type { TObject } from '@sinclair/typebox';
import type { Column, DeleteMark, WhereItem } from '../utils/types';

const DEFAULT_PAGE_SIZE = 10;



type ParseResult = Omit<TableOptions, 'globalCondition'> & {
    COLUMN_MAP: Map<string, Column>,
    F2C: Map<string, string>,
    C2F: Map<string, string>,

    queryFields: string,
    detialFields: string,
    globalCondition: Array<WhereItem>
}


export const convertField = (RESERVED_WORDS: Set<string>, wrapFn: (txt: string) => string, property: string, column?: string): string => {


    const attr = _.toLower(property);
    const attrIsReserved = RESERVED_WORDS.has(attr);
    if (column == property || column == null) {
        if (attrIsReserved) return wrapFn(property);
        return property;
    }
    const field = _.toLower(column);
    const fieldIsReserved = RESERVED_WORDS.has(field);
    return `${fieldIsReserved ? wrapFn(column) : column} AS ${attrIsReserved ? wrapFn(property) : property}`;

}


export const parseOptions = (RESERVED_WORDS: Set<string>, tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions, wrapFn: (txt: string) => string): ParseResult => {
    const CONFIG: ParseResult = {
        pageSize: tbOptions?.pageSize || dbOptions?.pageSize || DEFAULT_PAGE_SIZE,
        strictQuery: tbOptions?.strictQuery || dbOptions?.strictQuery || false,
        strictEntity: tbOptions?.strictEntity || dbOptions?.strictEntity || false,
        COLUMN_MAP: new Map<string, Column>(),
        F2C: new Map<string, string>(),
        C2F: new Map<string, string>(),
        queryFields: '*',
        detialFields: '*',
        globalCondition: [],
    }


    const GuessSortFields: string[] = [], QueryFields = [], DetailFields = []
    const fields = _.keys(tbSchema.properties);
    let delMark: WhereItem = null;

    for (let field of fields) {

        let properties = tbSchema.properties[field];
        let column = properties.column || field;
        CONFIG.F2C.set(field, column);
        CONFIG.C2F.set(column, field);
        CONFIG.COLUMN_MAP.set(field, properties);
        if (field != column) {
            CONFIG.C2F.set(field, field);
            CONFIG.F2C.set(column, column);
            CONFIG.COLUMN_MAP.set(column, properties);
        }

        if (properties.isModify) GuessSortFields.unshift(field);    // 默认按最后修改时间
        if (properties.isCreate) GuessSortFields.push(field);       // 默认按创建时间

        if (properties.delMark !== undefined && properties.delMark !== null) {
            const type = getFieldType(properties);
            delMark = { column, type, fn: '!=', value: properties.delMark }
        }
        DetailFields.push(convertField(RESERVED_WORDS, wrapFn, field, column));
        if (properties.ignore !== true) {
            QueryFields.push(convertField(RESERVED_WORDS, wrapFn, field, column));
        }
    };

    if (QueryFields.length > 0) CONFIG.queryFields = QueryFields.join(', ');
    if (DetailFields.length > 0) CONFIG.detialFields = DetailFields.join(', ');


    if (tbOptions.rowKey) {
        if (CONFIG.F2C.has(tbOptions.rowKey)) {
            CONFIG.rowKey = CONFIG.F2C.get(tbOptions.rowKey);
        }
    }
    if (CONFIG.rowKey == null && dbOptions?.rowKey && CONFIG.F2C.has(dbOptions.rowKey)) {
        CONFIG.rowKey = CONFIG.F2C.get(dbOptions.rowKey);
    }


    if (tbOptions?.orderBy) {
        CONFIG.orderBy = validateSort(tbOptions.orderBy, CONFIG.F2C);
    } else if (GuessSortFields.length) {
        CONFIG.orderBy = validateSort({ order: GuessSortFields[0], by: 'desc' }, CONFIG.F2C);
    } else if (CONFIG.rowKey) {
        const columnSchema = CONFIG.COLUMN_MAP.get(CONFIG.C2F.get(CONFIG.rowKey));
        if (columnSchema && columnSchema.type == 'number') {
            CONFIG.orderBy = { order: CONFIG.rowKey, by: 'desc' };
        }
    }
    if (tbOptions.globalCondition == null) {
        CONFIG.globalCondition = [];
    } else {
        if (_.isArray(tbOptions.globalCondition)) {
            CONFIG.globalCondition = [...tbOptions.globalCondition]
        } else {
            CONFIG.globalCondition = queryToCondition(CONFIG.strictQuery, tbOptions.globalCondition, CONFIG.COLUMN_MAP, new Map()).items as any;
        }
    }
    if (delMark) {
        CONFIG.globalCondition.unshift(delMark);
    }
    return CONFIG;

}

// type CheckQuery = (query: TObject) => BodyInit;
// const CheckQueryBuilder = (): CheckQuery =>  {
//     return () => null
// }



// /**
//  * Auto convert data
//  * check row data while insert or update
//  * */
// protected checkEntity(obj: any, isAdd = false): any {
//     // checkEntity(this.schema)
//     let clone: any = {}
//     this.COLUMN_MAP.forEach((schema, key) => {
//         let field = schema.column || key;
//         if (_.has(obj, key)) clone[field] = obj[key];
//         let type = getFieldType(schema);
//         if (type == 'date') {
//             if (schema.isCreate) {
//                 if (isAdd) {
//                     clone[field] = new Date();
//                 } else {
//                     _.unset(clone, field);
//                 }
//                 return;
//             }
//             if (schema.isModify) {
//                 clone[field] = new Date();
//                 return;
//             }
//             if (obj[key] === null || obj[key] === 0) {
//                 clone[field] = null;
//             } else {
//                 clone[field] = toDate(obj[key]);
//             }
//         }
//     })
//     return clone;
// }


