import _ from './dash';
import { queryToCondition } from '../utils/ConditionUtil';
import { validateSort } from '../utils/ValidateUtil'
import { parseOptions, } from './utils';

import type { TableOptions, DatabaseOptions, QueryBuilder } from './types';
import type { TObject, TSchema } from '@sinclair/typebox';
import type { WhereParam, OrderBy, SQLStatement, QuerySchema, WhereCondition, WhereDefine, WhereItem, QueryParam, RowKeyType, DeleteMark } from '../utils/types';


export abstract class BaseQuery implements QueryBuilder {
    private readonly RESERVED_WORD: Set<string>;
    protected readonly SCHEMA: TObject;

    protected readonly tableName: string;
    protected readonly ROW_KEY: string = null;
    protected readonly PAGE_SIZE: number;
    protected readonly ORDER_BY: OrderBy = null;

    protected readonly STRICT_QUERY: boolean;
    protected readonly STRICT_ENTITY: boolean;
    protected readonly QUERY_FIELDS: string;
    protected readonly DETAIL_FIELDS: string;

    protected readonly COLUMN_MAP: Map<string, TSchema>;
    protected readonly DEL_MARK: DeleteMark = null;

    /**
     * filed to filed
     * no wraped column to filed
     * wraped column (no select) to filed
     * wraped column (select) to field
    */
    protected readonly C2F = new Map<string, string>(); // Column To Field , SUPPORT Wraped Field and Selected field

    /**
     * filed to wraped column
     * not column to wraped column
     * wraped column to wraped column
    */
    protected readonly F2W = new Map<string, string>(); // Field To Column (ONLY WRAP : SELECT "user")
    /**
     * filed to wraped column (select)
     * not column to wraped column  (select)
     * wraped column to wraped column (select)
    */
    protected readonly F2S = new Map<string, string>(); // Field To Column (WITH AS : SELECT "user" AS userName)

    protected readonly GLOBAL_CONDITION: Array<WhereItem> = [];

    private QUERY_CACHE = new Map<string, WhereDefine>();

    protected abstract initReservedWord(): Set<string>;
    protected abstract wrapField(field: string): string;

    constructor(tbName: string, tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions) {
        this.SCHEMA = tbSchema
        this.RESERVED_WORD = this.initReservedWord();

        const CONFIG = parseOptions(this.RESERVED_WORD, tbName, tbSchema, tbOptions || {}, dbOptions || {}, this.wrapField);
        this.tableName = CONFIG.tableName;
        if (CONFIG.rowKey) this.ROW_KEY = CONFIG.rowKey;
        this.PAGE_SIZE = CONFIG.pageSize;
        if (CONFIG.orderBy) this.ORDER_BY = CONFIG.orderBy;
        if (CONFIG.delMark) this.DEL_MARK = CONFIG.delMark;

        this.QUERY_FIELDS = CONFIG.queryFields;
        this.DETAIL_FIELDS = CONFIG.detialFields;

        this.STRICT_QUERY = CONFIG.strictQuery;
        this.STRICT_ENTITY = CONFIG.strictEntity;
        this.COLUMN_MAP = CONFIG.COLUMN_MAP;
        this.C2F = CONFIG.C2F;
        this.F2W = CONFIG.F2W;
        this.F2S = CONFIG.F2S;
        this.GLOBAL_CONDITION = CONFIG.globalCondition;

    }


    /**
     * 字段：
     * 是否在 select 子名中
    */
    protected _wrapColumn(column: string, select: boolean = false): string {
        if (select) return this.F2S.get(column) || column;
        return this.F2W.get(column) || column;
    }

    convertQuery(query: QueryParam): WhereCondition {
        return queryToCondition(this.STRICT_QUERY, query, this.COLUMN_MAP, this.QUERY_CACHE);
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
            const columns = fields.filter(field => this.F2S.has(field)).map(filed => this.F2S.get(filed));
            if (columns.length == 0) return `SELECT ${this.QUERY_FIELDS} FROM ${this.tableName} `;
            return `SELECT ${columns.join(', ')} FROM ${this.tableName} `;
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
        let orderyBy = validateSort({ order: query._order, by: query._by }, this.F2W);
        if (orderyBy == null) return '';
        return `ORDER BY ${this._wrapColumn(orderyBy.order)} ${orderyBy.by}`;
    }

    limit(query?: QuerySchema | number, start: number = 0): string {
        if (_.isNumber(query)) return `LIMIT ${query} OFFSET ${start}`
        const _start = query?._start || 0;
        const _count = query?._count || this.PAGE_SIZE;
        return `LIMIT ${_count} OFFSET ${_start}`
    }

    orderByLimit(query?: QuerySchema | boolean, limit: boolean = false): string {
        if (query == undefined || query == null || query === false) {
            if (limit) return `${this.orderBy(true)} ${this.limit(this.PAGE_SIZE, 0)}`
            return ''
        }
        if (query === true) return this.orderBy(true);
        return `${this.orderBy(query)} ${this.limit(query)}`
    }


    byId(value: RowKeyType): SQLStatement {
        if (this.ROW_KEY == null) throw ('Row Key is not defined');
        return this.byField(this.ROW_KEY, value);
    }

    public abstract byField(field: string, value: string | number | boolean, startIdx?: number): SQLStatement;
    public abstract where(condition: WhereParam, startIdx?: number): SQLStatement;
    public abstract fixWhere(statement?: SQLStatement): SQLStatement;

}
