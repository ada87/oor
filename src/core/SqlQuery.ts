import _ from 'lodash';
import { queryToCondition } from '../utils/ConditionUtil';
import { validateSort } from '../utils/ValidateUtil'
import { parseOptions, convertField } from './utils';

import type { TableOptions, DatabaseOptions, QueryBuilder } from './types';
import type { TObject } from '@sinclair/typebox';
import type { WhereParam, OrderBy, Column, SQLStatement, QuerySchema, WhereCondition, WhereDefine } from '../utils/types';

// QuerySchema => WhereCondition => SQLStatement

export abstract class BaseQuery implements QueryBuilder {

    protected readonly tableName: string;
    protected readonly ROW_KEY: string = null;
    protected readonly PAGE_SIZE: number;
    protected readonly ORDER_BY: OrderBy = null;

    protected readonly STRICT_QUERY: boolean;
    protected readonly STRICT_ENTITY: boolean;
    protected readonly QUERY_FIELDS: string;
    protected readonly DETAIL_FIELDS: string;

    protected readonly COLUMN_MAP: Map<string, Column>;
    private readonly F2C = new Map<string, string>(); // Field To Column
    private readonly C2F = new Map<string, string>(); // Column To Field

    protected readonly DEL_MARK: { field: string, value: string | number | boolean, } = null;


    private FIELD_CACHE = new Map<string, WhereDefine>();


    constructor(tbName: string, tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions) {
        this.tableName = tbName;
        const CONFIG = parseOptions(tbSchema, tbOptions, dbOptions);
        if (CONFIG.rowKey) this.ROW_KEY = CONFIG.rowKey;
        this.PAGE_SIZE = CONFIG.pageSize;
        if (CONFIG.orderBy) this.ORDER_BY = CONFIG.orderBy;

        this.QUERY_FIELDS = CONFIG.queryFields;
        this.DETAIL_FIELDS = CONFIG.detialFields;

        this.STRICT_QUERY = CONFIG.strictQuery;
        this.STRICT_ENTITY = CONFIG.strictEntity;
        this.COLUMN_MAP = CONFIG.COLUMN_MAP;
        this.F2C = CONFIG.F2C;
        this.C2F = CONFIG.C2F;
        this.DEL_MARK = CONFIG.delMark;
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
            const queryFields = columns.map(column => convertField(this.C2F.get(column), column)).join(', ');
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
        const count = query?.count_ || this.PAGE_SIZE;
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
        // if (this.ROW_KEY == null) throw ('Row Key is not defined');
        return this.byField(this.ROW_KEY, value);
    }

    count(distinct?: boolean): string {
        return `SELECT COUNT(${distinct ? 'DISTINCT' : ''} ${this.ROW_KEY ? this.ROW_KEY : '*'}) FROM ${this.tableName} `;
    }

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

