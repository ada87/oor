import _ from './dash';
import { queryToCondition } from '../utils/ConditionUtil';
import { validateSort } from '../utils/ValidateUtil'
import { parseOptions, convertField } from './utils';

import type { TableOptions, DatabaseOptions, QueryBuilder } from './types';
import type { TObject } from '@sinclair/typebox';
import type { WhereParam, OrderBy, Column, DeleteMark, SQLStatement, QuerySchema, WhereCondition, WhereDefine, WhereItem } from '../utils/types';


export abstract class BaseQuery implements QueryBuilder {
    private readonly RESERVED_WORD: Set<string>;

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

    protected readonly DEL_MARK: DeleteMark = null;
    protected readonly GLOBAL_CONDITION: Array<WhereItem> = [];



    private FIELD_CACHE = new Map<string, WhereDefine>();

    protected abstract initReservedWord(): Set<string>;
    protected abstract wrapField(field: string): string;

    constructor(tbName: string, tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions) {
        this.RESERVED_WORD = this.initReservedWord();
        this.tableName = convertField(this.RESERVED_WORD, this.wrapField, tbName);
        const CONFIG = parseOptions(this.RESERVED_WORD, tbSchema, tbOptions, dbOptions, this.wrapField);
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
        this.GLOBAL_CONDITION = CONFIG.globalCondition;

    }

    private _wrapColumn(column: string): string {
        return convertField(this.RESERVED_WORD, this.wrapField, column)
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
            const queryFields = columns.map(column => convertField(this.RESERVED_WORD, this.wrapField, this.C2F.get(column), column)).join(', ');
            return `SELECT ${queryFields} FROM ${this.tableName} `;
        }

        return `SELECT ${this.QUERY_FIELDS} FROM ${this.tableName} `;
    }

    count(field?: boolean | string, distinct?: boolean) {
        let countFiled = _.isString(field) ? field : (this.ROW_KEY || '*');
        let isDistinct = typeof distinct === 'boolean' ? distinct : (
            typeof field === 'boolean' ? field : false
        );
        return `SELECT COUNT(${isDistinct ? 'DISTINCT ' : ''}${this._wrapColumn(countFiled)}) AS total FROM ${this.tableName}`;
    }

    orderBy(query?: QuerySchema | boolean): string {
        if (query == undefined || query == null || query === false) return '';
        if (query === true) {
            if (this.ORDER_BY) return `ORDER BY ${this._wrapColumn(this.ORDER_BY.order)} ${this.ORDER_BY.by}`;
            return ''
        }
        let orderyBy = validateSort({ order: query._order_, by: query._by_ }, this.F2C);
        if (orderyBy == null) return '';
        return `ORDER BY ${this._wrapColumn(orderyBy.order)} ${orderyBy.by}`;
    }

    limit(query?: QuerySchema | number, start: number = 0): string {
        if (_.isNumber(query)) return `LIMIT ${query} OFFSET ${start}`
        const _start = query?._start_ || 0;
        const _count = query?._count_ || this.PAGE_SIZE;
        return `LIMIT ${_count} OFFSET ${_start}`
    }

    orderByLimit(query?: QuerySchema | boolean): string {
        if (query == undefined || query == null || query === false) return '';
        if (query === true) return this.orderBy(true);
        return `${this.orderBy(query)} ${this.limit(query)}`
    }

    byField(field: string, value: string | number | boolean, startIdx: number = 1): SQLStatement {
        if (!this.F2C.has(field)) throw new Error(`Field ${field} not found in Table ${this.tableName}`);
        let column = this.F2C.get(field);
        let sql = `${this._wrapColumn(column)} = $${startIdx}`; // msyql/sqlite 为 "?"
        return [sql, [value]];
    }

    byId(value: string | number): SQLStatement {
        // if (this.ROW_KEY == null) throw ('Row Key is not defined');
        return this.byField(this.ROW_KEY, value);
    }


    public abstract where(condition: WhereParam, startIdx?: number): SQLStatement;
    public abstract fixWhere(statement?: SQLStatement): SQLStatement;

}
