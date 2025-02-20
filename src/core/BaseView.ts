import { BaseQuery } from './BaseDB';

import type { QueryProvider, TableOptions, QueryBuilder, QueryExecutor, Database, View } from './types'
import type { TObject, Static } from '@sinclair/typebox';
import type { WhereParam, SQLStatement, QuerySchema, QueryOrderBy } from '../utils/types';


export abstract class BaseView<C, S extends TObject, B extends QueryBuilder> extends BaseQuery<C> implements View<Static<S>> {

    public readonly BUILDER: B;

    protected abstract readonly EXECUTOR: QueryExecutor<C, Static<S>>;

    private logSQL(sql: string, param: any) {
        console.log(sql, param)

    }

    /**
     * @param tableName Data table name, "${schemaName}.${tableName}"  
     *  "${schemaName}." can be ignore with the default search_path.
     * @param schema The Object Schema, oor will not validate the value
     * @param options (Table/View) Options
     */
    constructor(P: QueryProvider<B>, db: Database<C>, tbName: string, tbSchema: S, tbOptions?: TableOptions) {
        super(db);
        const dbOptions = db.getOption();
        this.BUILDER = new P(tbName, tbSchema, tbOptions, dbOptions);
        this.init();
    }
    protected init() { };

    protected queryStatement(SELECT: string, STATEMENT?: SQLStatement, ORDER_BY_LIMIT: string = '', fixed = true): SQLStatement {
        const { BUILDER } = this;
        if (fixed) {
            const [WHERE, PARAM] = BUILDER.fixWhere(STATEMENT);
            if (WHERE && WHERE.length > 0) {
                return [`${SELECT} WHERE ${WHERE} ${ORDER_BY_LIMIT}`, PARAM];
            }
            return [`${SELECT}  ${ORDER_BY_LIMIT}`, []];
        }
        if (STATEMENT && STATEMENT[0] && STATEMENT[0].length > 0) {
            return [`${SELECT} WHERE ${STATEMENT[0]} ${ORDER_BY_LIMIT}`, STATEMENT[1]];
        }
        return [`${SELECT} ${ORDER_BY_LIMIT}`, []];
    }


    async _query(SELECT: string, STATEMENT: SQLStatement, ORDER_BY_LIMIT: string, fixed = true): Promise<Array<Static<S>>> {
        const { EXECUTOR } = this;
        const [SQL, PARAM] = this.queryStatement(SELECT, STATEMENT, ORDER_BY_LIMIT, fixed);;
        const conn = await this.getConn();
        // this.logSQL(SQL, PARAM);
        const result = await EXECUTOR.query(conn, SQL, PARAM);
        return result;
    }


    async all(): Promise<Static<S>[]> {
        const { BUILDER } = this;
        const SELECT = BUILDER.select(false);
        const result = await this._query(SELECT, null, '');;
        return result;
    }



    async queryPagination(query?: QuerySchema): Promise<{ total: number; list: Static<S>[]; }> {
        const { BUILDER, EXECUTOR } = this;
        const SELECT = BUILDER.select();
        const COUNT = BUILDER.count();
        const CONDITION = BUILDER.convertQuery(query)
        const STATEMENT = BUILDER.where(CONDITION);
        const ORDER_BY_LIMIT = BUILDER.orderByLimit(query);
        const [QUERY_SQL, QUERY_PARAM] = this.queryStatement(SELECT, STATEMENT, ORDER_BY_LIMIT);
        const [COUNT_SQL, COUNT_PARAM] = this.queryStatement(COUNT, STATEMENT, '');
        const conn = await this.getConn();
        this.logSQL(QUERY_SQL, QUERY_PARAM);
        this.logSQL(COUNT_SQL, COUNT_PARAM);
        const [list, countResp] = await Promise.all([
            EXECUTOR.query(conn, QUERY_SQL, QUERY_PARAM),
            EXECUTOR.get<{ total: string }>(conn, COUNT_SQL, COUNT_PARAM)
        ])
        return { list, total: (countResp?.total) ? parseInt(countResp.total) : 0 }
    }

    async queryByField(field: string, value: string | number | boolean): Promise<Static<S>[]> {
        const { BUILDER } = this;
        const SELECT = BUILDER.select();
        const STATEMENT = BUILDER.byField(field, value);
        const ORDER_BY_LIMIT = BUILDER.orderBy(true);
        const result = await this._query(SELECT, STATEMENT, ORDER_BY_LIMIT);
        return result;
    }

    async queryByCondition(condition?: WhereParam, query: QuerySchema | boolean = true): Promise<Static<S>[]> {
        const { BUILDER } = this;
        const SELECT = BUILDER.select();
        const STATEMENT = BUILDER.where(condition);
        const ORDER_BY_LIMIT = BUILDER.orderByLimit(query);
        const result = await this._query(SELECT, STATEMENT, ORDER_BY_LIMIT);
        return result;
    }

    async query(query?: QuerySchema): Promise<Static<S>[]> {
        const CONDITION = this.BUILDER.convertQuery(query)
        return await this.queryByCondition(CONDITION, query);
    }

    protected async _get(SELECT: string, STATEMENT: SQLStatement, ORDER_BY_LIMIT: string = 'LIMIT 1 OFFSET 0', fixed = true): Promise<Static<S>> {
        const { EXECUTOR } = this;
        const [SQL, PARAM] = this.queryStatement(SELECT, STATEMENT, ORDER_BY_LIMIT, fixed);;
        const conn = await this.getConn();
        this.logSQL(SQL, PARAM);
        const result = await EXECUTOR.get(conn, SQL, PARAM);
        return result;
    }

    async getById(id: string | number): Promise<Static<S>> {
        const { BUILDER } = this;
        const SELECT = BUILDER.select(true);
        const STATEMENT = BUILDER.byId(id);
        const result = await this._get(SELECT, STATEMENT);
        return result;
    }
    async getByField(field: string, value: string | number): Promise<Static<S>> {
        const { BUILDER } = this;
        const SELECT = BUILDER.select(true);
        const STATEMENT = BUILDER.byField(field, value);
        const result = await this._get(SELECT, STATEMENT);
        return result;
    }

    async getByCondition(condition: WhereParam, query?: QueryOrderBy): Promise<Static<S>> {
        const { BUILDER } = this;
        const SELECT = BUILDER.select(true);
        const STATEMENT = BUILDER.where(condition);
        const ORDER_BY_LIMIT = (query && query._order_ && query._by_) ? BUILDER.orderByLimit({ ...query, _count_: 1 }) : undefined
        const result = await this._get(SELECT, STATEMENT, ORDER_BY_LIMIT);
        return result;
    }


    async getByQuery(query: QuerySchema): Promise<Static<S>> {
        const CONDITION = this.BUILDER.convertQuery(query);
        return await this.getByCondition(CONDITION, query);
    }
}