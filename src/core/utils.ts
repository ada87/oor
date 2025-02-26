import _ from './dash';
import { validateSort } from '../utils/ValidateUtil';
import { getFieldType } from '../utils/SQLUtil';
import { newDate } from '../utils/TimeUtil'
import { queryToCondition } from '../utils/ConditionUtil';
import { Value } from '@sinclair/typebox/value';


import type { DatabaseOptions, TableOptions } from './types'
import type { TObject, TSchema } from '@sinclair/typebox';
import type { DeleteMark, WhereItem } from '../utils/types';

const DEFAULT_PAGE_SIZE = 10;



type ParseResult = Omit<TableOptions, 'globalCondition'> & {
    tableName: string,
    COLUMN_MAP: Map<string, TSchema>,
    F2W: Map<string, string>,
    F2S: Map<string, string>,
    C2F: Map<string, string>,
    delMark: DeleteMark,
    queryFields: string,
    detialFields: string,
    globalCondition: Array<WhereItem>
}

/**
 * @returns [NO AS, WITH AS] 
*/
const convertField = (RESERVED_WORDS: Set<string>, wrapFn: (txt: string) => string, property: string, column?: string): [boolean, string, string] => {
    const attr = _.toLower(property);
    const attrIsReserved = RESERVED_WORDS.has(attr);
    if (column == property || column == null) {
        if (attrIsReserved) return [true, wrapFn(property), wrapFn(property),];
        return [false, property, property];
    }
    const field = _.toLower(column);
    const columnIsReserved = RESERVED_WORDS.has(field);
    const columnWraped = columnIsReserved ? wrapFn(column) : column;
    return [
        columnIsReserved,
        columnWraped,
        `${columnWraped} AS ${attrIsReserved ? wrapFn(property) : property}`,
    ]
}


export const parseOptions = (RESERVED_WORDS: Set<string>, tbName: string, tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions, wrapFn: (txt: string) => string): ParseResult => {
    const CONFIG: ParseResult = {
        tableName: convertField(RESERVED_WORDS, wrapFn, tbName)[1],
        pageSize: tbOptions?.pageSize || dbOptions?.pageSize || DEFAULT_PAGE_SIZE,
        strictQuery: tbOptions?.strictQuery || dbOptions?.strictQuery || false,
        strictEntity: tbOptions?.strictEntity || dbOptions?.strictEntity || false,
        COLUMN_MAP: new Map<string, TSchema>(),
        C2F: new Map<string, string>(),
        F2W: new Map<string, string>(),
        F2S: new Map<string, string>(),
        queryFields: '*',
        detialFields: '*',
        globalCondition: [],
        delMark: null,
    }


    const GuessSortFields: string[] = [], QueryFields = [], DetailFields = []
    const fields = _.keys(tbSchema.properties);
    // let delMark: WhereItem = null;

    for (let field of fields) {

        let properties = tbSchema.properties[field];
        let column = properties.column || field;
        let [isWraped, columnWraped, columnSelected] = convertField(RESERVED_WORDS, wrapFn, field, column);
        CONFIG.C2F.set(column, field);
        CONFIG.F2W.set(field, columnWraped);
        CONFIG.F2S.set(field, columnSelected);
        CONFIG.COLUMN_MAP.set(field, properties);
        if (isWraped) {
            CONFIG.C2F.set(columnWraped, field);
            CONFIG.F2W.set(columnWraped, columnWraped);
            CONFIG.F2S.set(columnWraped, columnSelected);
            CONFIG.COLUMN_MAP.set(columnWraped, properties);
        }

        if (field != column) {
            CONFIG.C2F.set(field, field);
            CONFIG.C2F.set(columnSelected, field);
            CONFIG.F2W.set(columnSelected, columnWraped);
            CONFIG.F2S.set(columnSelected, columnSelected)
            CONFIG.COLUMN_MAP.set(columnSelected, properties);
            CONFIG.COLUMN_MAP.set(column, properties);

        }

        if (properties.isModify) GuessSortFields.unshift(field);    // 默认按最后修改时间
        if (properties.isCreate) GuessSortFields.push(field);       // 默认按创建时间

        if (properties.delMark !== undefined && properties.delMark !== null) {
            CONFIG.delMark = { column: columnWraped, value: properties.delMark }
        }
        DetailFields.push(columnSelected);
        if (properties.ignore !== true) {
            QueryFields.push(columnSelected);
        }
    };

    if (QueryFields.length > 0) CONFIG.queryFields = QueryFields.join(', ');
    if (DetailFields.length > 0) CONFIG.detialFields = DetailFields.join(', ');


    if (tbOptions.rowKey) {
        if (CONFIG.C2F.has(tbOptions.rowKey)) {
            CONFIG.rowKey = CONFIG.C2F.get(tbOptions.rowKey);
        }
    }
    if (CONFIG.rowKey == null && dbOptions?.rowKey && CONFIG.C2F.has(dbOptions.rowKey)) {
        CONFIG.rowKey = CONFIG.C2F.get(dbOptions.rowKey);
    }


    if (tbOptions?.orderBy) {
        CONFIG.orderBy = validateSort(tbOptions.orderBy, CONFIG.F2W);
    } else if (GuessSortFields.length) {
        CONFIG.orderBy = validateSort({ order: GuessSortFields[0], by: 'desc' }, CONFIG.F2W);
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
    if (CONFIG.delMark) {
        CONFIG.globalCondition.unshift({
            ...CONFIG.delMark,
            fn: '<>',
            type: typeof CONFIG.delMark.value == 'number' ? 'integer' : 'string',
        });
    }
    return CONFIG;

}




type CheckEntityFn = (obj: object, isAdd: boolean) => object
export const buildCheckEntity = (SCHEMA: TObject, COLUMN_MAP: Map<string, TSchema>, C2F: Map<string, string>, strict: boolean): CheckEntityFn => {

    const validateFn = strict ? (clone: object) => {
        const result = Value.Errors(SCHEMA, clone);
        let err = result.First();
        if (err) {
            throw new Error('Entity Has Some Error')
        }
    } : () => { }

    return (obj: object, isAdd = false) => {
        let clone: any = {};
        const keys = new Set(_.keys(obj));
        if (strict) {
            for (let key of keys) {
                if (!C2F.has(key)) {
                    throw new Error(`Field ${key} is not in the Schema`)
                }
            }
        }
        for (let key of keys) {
            const field = C2F.get(key);
            const schema = COLUMN_MAP.get(field);
            if (schema == null) continue;
            clone[field] = obj[key];
        }
        for (let [field, schema] of COLUMN_MAP) {
            let type = getFieldType(schema);
            if (type != 'date') continue;
            if (schema.isCreate) {
                if (isAdd) {
                    clone[C2F.get(field)] = newDate(schema);
                } else {
                    _.unset(clone, C2F.get(field));
                }
                continue;
            }
            if (schema.isModify) {
                clone[C2F.get(field)] = newDate(schema);
                continue;
            }
        }
        validateFn(clone)
        return clone;
    }
}
