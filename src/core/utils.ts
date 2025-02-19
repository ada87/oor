import _ from 'lodash';
import { validateSort } from '../utils/ValidateUtil';

import type { DatabaseOptions, TableOptions } from './types'
import type { TObject } from '@sinclair/typebox';
import type { Column } from '../utils/types';
import type { OrderBy } from '../utils/types';

const DEFAULT_PAGE_SIZE = 10;
const GLOBAL_ID_FIELD = new Set<string>(['id', 'guid', 'uuid']);


type ParseResult = DatabaseOptions & {
    // rowKey?: string,
    // pageSize: number,
    // STRICT_QUERY: boolean,
    COLUMN_MAP: Map<string, Column>,
    F2C: Map<string, string>,
    C2F: Map<string, string>,

    queryFields: string,
    detialFields: string,
    delMark?: { field: string, value: string | number | boolean },
    orderBy?: OrderBy
}


export const convertField = (property: string, column?: string): string => {
    if (column == property) return '`' + column + '`';
    return `\`${column}\` AS \`${property}\``;
}


export const parseOptions = (tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions): ParseResult => {
    const CONFIG: ParseResult = {
        pageSize: tbOptions?.pageSize || dbOptions?.pageSize || DEFAULT_PAGE_SIZE,
        strictQuery: tbOptions?.strictQuery || dbOptions?.strictQuery || false,
        strictEntity: tbOptions?.strictEntity || dbOptions?.strictEntity || false,
        COLUMN_MAP: new Map<string, Column>(),
        F2C: new Map<string, string>(),
        C2F: new Map<string, string>(),
        queryFields: ' * ',
        detialFields: ' * ',
    }

    var rowKey = tbOptions?.rowKey;


    const GuessSortFields: string[] = [], QueryFields = [], DetailFields = []
    let GuessIdField: string = null;
    const fields = _.keys(tbSchema.properties);

    for (let field of fields) {

        let properties = tbSchema.properties[field];
        let column = properties.column || field;
        CONFIG.F2C.set(field, column);
        CONFIG.F2C.set(column, column);
        CONFIG.C2F.set(column, field);
        CONFIG.C2F.set(field, field);
        CONFIG.COLUMN_MAP.set(field, properties);

        if (rowKey == null && GuessIdField == null && GLOBAL_ID_FIELD.has(field)) {
            GuessIdField = column;
        }


        if (properties.isModify) GuessSortFields.unshift(field);    // 默认按最后修改时间
        if (properties.isCreate) GuessSortFields.push(field);       // 默认按创建时间

        if (CONFIG.delMark == null && _.has(properties, 'delMark') && properties.delMark !== null) {
            CONFIG.delMark = {
                field: column,
                value: properties.delMark,
            };
        }
        DetailFields.push(convertField(field, column));
        if (properties.ignore !== true) {
            QueryFields.push(convertField(field, column));
        }
    };

    if (QueryFields.length > 0) CONFIG.queryFields = QueryFields.join(', ');
    if (DetailFields.length > 0) CONFIG.detialFields = DetailFields.join(', ');

    if (rowKey == null) {
        if (GuessIdField) {
            rowKey = GuessIdField;
        } else if (dbOptions?.rowKey && CONFIG.F2C.has(dbOptions.rowKey)) {
            rowKey = CONFIG.F2C.get(dbOptions.rowKey);
        }
    }
    if (rowKey) {
        CONFIG.rowKey = rowKey;
    }

    if (tbOptions?.orderBy) {
        CONFIG.orderBy = validateSort(tbOptions.orderBy, CONFIG.F2C);
    } else if (GuessSortFields.length) {
        CONFIG.orderBy = validateSort({ order: GuessSortFields[0], by: 'desc' }, CONFIG.F2C);
    } else if (rowKey) {
        CONFIG.orderBy = { order: rowKey, by: 'desc' };
    }

    return CONFIG;

}



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


