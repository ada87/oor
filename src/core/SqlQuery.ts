import _ from 'lodash';
import { queryToCondition } from '../utils/ConditionUtil';
import { validateSort } from '../utils/ValidateUtil'

import type { TableOptions, DatabaseOptions, QueryBuilder } from './types';
import type { TObject } from '@sinclair/typebox';
import type { WhereParam, OrderBy, Column, SQLStatement, QuerySchema, WhereCondition, WhereDefine } from '../utils/types';


const DEFAULT_PAGE_SIZE = 10;
const GLOBAL_ID_FIELD = new Set<string>(['id', 'guid', 'uuid']);

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





export abstract class BaseQuery implements QueryBuilder {

    protected readonly tableName: string;
    protected readonly rowKey: string;
    protected readonly SORT: OrderBy = null;
    protected readonly pageSize: number;
    protected readonly STRICT_QUERY: boolean = false;

    protected COLUMN_MAP: Map<string, Column>;

    protected readonly QUERY_FIELDS: string = '*';
    protected readonly DETAIL_FIELDS: string = '*';
    protected readonly DEL_MARK: { field: string, value: string | number | boolean, } = null;

    private readonly F2C = new Map<string, string>(); // Field To Column
    private readonly C2F = new Map<string, string>(); // Column To Field

    private FIELD_CACHE = new Map<string, WhereDefine>();


    constructor(tbName: string, tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions) {
        this.tableName = tbName;
        this.rowKey = tbOptions?.rowKey;
        this.pageSize = tbOptions?.pageSize || dbOptions?.pageSize || DEFAULT_PAGE_SIZE;
        this.STRICT_QUERY = tbOptions?.strictQuery || dbOptions?.strictQuery || false;

        this.COLUMN_MAP = new Map<string, Column>();
        const GuessSortFields: string[] = [], QueryFields = [], DetailFields = []
        let GuessIdField: string = null;

        const fields = _.keys(tbSchema.properties);

        for (let field of fields) {

            let properties = tbSchema.properties[field];
            let column = properties.column || field;
            this.F2C.set(field, column);
            this.F2C.set(column, column);
            this.C2F.set(column, field);
            this.C2F.set(field, field);
            this.COLUMN_MAP.set(field, properties);
            if (this.rowKey == null && GuessIdField == null && GLOBAL_ID_FIELD.has(field)) {
                GuessIdField = field;
            }


            if (properties.isModify) GuessSortFields.unshift(field);    // 默认按最后修改时间
            if (properties.isCreate) GuessSortFields.push(field);       // 默认按创建时间

            if (this.DEL_MARK == null && _.has(properties, 'delMark') && properties.delMark !== null) {
                this.DEL_MARK = {
                    field: column,
                    value: properties.delMark,
                };
            }
            DetailFields.push(this.convertField(field, column));
            if (properties.ignore !== true) {
                QueryFields.push(this.convertField(field, column));
            }
        };

        if (QueryFields.length > 0) this.QUERY_FIELDS = QueryFields.join(', ');
        if (DetailFields.length > 0) this.DETAIL_FIELDS = DetailFields.join(', ');

        if (this.rowKey == null) {
            this.rowKey = GuessIdField || dbOptions?.rowKey || 'id';
        } else {
            GuessSortFields.push(this.rowKey);
        }

        if (tbOptions?.sort) {
            this.SORT = validateSort(tbOptions.sort, this.F2C);
        } else if (GuessSortFields.length) {
            this.SORT = validateSort({ order: GuessSortFields[0], by: 'desc' }, this.F2C);
        }

    }


    convertField(property: string, column?: string): string {
        if (column == property) return '`' + column + '`';
        return `\`${column}\` AS \`${property}\``;
    }

    convertQuery(query: QuerySchema): WhereCondition {
        return queryToCondition(this.STRICT_QUERY, query, this.COLUMN_MAP, this.FIELD_CACHE);
    }


    select(fields?: boolean | string | Array<string>): string {

        if (fields == null || fields == undefined) return `SELECT ${this.QUERY_FIELDS} FROM ${this.tableName} `;

        if (typeof fields == 'boolean') {
            if (fields) return `SELECT ${this.DETAIL_FIELDS} FROM ${this.tableName} `;
            return `SELECT ${this.QUERY_FIELDS} FROM ${this.tableName} `;
        }
        if (typeof fields == 'string') {
            let txt = fields.trim();
            if (txt.length == 0) return `SELECT ${this.QUERY_FIELDS} FROM ${this.tableName} `;
            return `SELECT ${txt} FROM ${this.tableName} `;
        }
        if (Array.isArray(fields)) {
            const columns = fields.filter(field => this.F2C.has(field)).map(filed => this.F2C.get(filed));
            if (columns.length == 0) return `SELECT ${this.QUERY_FIELDS} FROM ${this.tableName} `;
            const queryFields = columns.map(column => this.convertField(this.C2F.get(column), column)).join(', ');
            return `SELECT ${queryFields} FROM ${this.tableName} `;
        }

        return `SELECT ${this.QUERY_FIELDS} FROM ${this.tableName} `;
    }


    orderBy(query?: QuerySchema): string {
        let orderyBy = validateSort({ order: query.order_, by: query.by_ }, this.F2C);
        if (orderyBy == null) return '';
        return `ORDER BY \`${orderyBy.order}\` ${orderyBy.by}`;
    }
    limit(query?: QuerySchema): string {
        const start = query?.start_ || 0;
        const count = query?.count_ || this.pageSize;
        return `LIMIT ${count} OFFSET ${start}`
    }

    orderByLimit(query?: QuerySchema): string {
        return `${this.orderBy(query)} ${this.limit(query)}`
    }

    byField(field: string, value: string | number | boolean, startIdx?: number): SQLStatement {
        if (!this.F2C.has(field)) throw new Error(`Field ${field} not found in Table ${this.tableName}`);
        let column = this.F2C.get(field);
        let sql = `\`${column}\` = ?`;
        return [sql, [value]];
    }

    byId(value: string | number): SQLStatement {
        return this.byField(this.rowKey, value);
    }

    // count: (distinct?: boolean) => string;

    // byQuery: (query: QuerySchema) => SQLStatement;
    // byCondition: (condition: WhereParam) => SQLStatement;

    abstract where: (condition: WhereParam, startIdx?: number) => SQLStatement;
    abstract fixWhere: (statement?: SQLStatement) => SQLStatement;


}


// export const where: SqlWhere = (condition: WhereParam): [string, any[]] => {
//     const pos: QueryPos = { SQL: [], PARAM: [] };
//     let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
//     let err: string[] = [];
//     ConditionToWhere(root, pos, err);
//     throwErr(err, 'Some SQL Error Occur');
//     if (pos.SQL.length == 0) {
//         return ['', []]
//     };
//     return [pos.SQL.join(" " + root.link + " "), pos.PARAM]
// }


// export const where: SqlWhere = (condition: WhereParam, startIdx = 1): [string, any[]] => {
//     const pos: QueryPos = { SQL: [], PARAM: [], NUM: startIdx };
//     let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
//     let err: string[] = [];
//     ConditionToWhere(root, pos, err);
//     throwErr(err, 'Some SQL Error Occur');
//     if (pos.SQL.length == 0) {
//         return ['', []]
//     };
//     return [pos.SQL.join(" " + root.link + " "), pos.PARAM]
// }

