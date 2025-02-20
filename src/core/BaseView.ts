import { BaseQuery } from './BaseDB';

import type { QueryProvider, TableOptions, QueryBuilder, QueryExecutor, Database, View } from './types'
import type { TObject, Static } from '@sinclair/typebox';
import type { WhereParam, SQLStatement, QuerySchema } from '../utils/types';




export abstract class BaseView<C, S extends TObject, B extends QueryBuilder> extends BaseQuery<C> implements View<Static<S>> {

    public readonly BUILDER: B;

    protected abstract readonly EXECUTOR: QueryExecutor<C, Static<S>>;

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

    protected queryStatement(SELECT: string, ORDER_BY_LIMIT: string = '', STATEMENT?: SQLStatement, fixed = true): SQLStatement {
        const { BUILDER } = this;
        if (fixed) {
            const [WHERE, PARAM] = BUILDER.fixWhere(STATEMENT);
            if (WHERE && WHERE.length > 0) {
                return [`${SELECT} ${WHERE} ${ORDER_BY_LIMIT}`, PARAM];
            }
            return [`${SELECT}  ${ORDER_BY_LIMIT}`, []];
        }
        if (STATEMENT) {
            return [`${SELECT} ${STATEMENT[0]} ${ORDER_BY_LIMIT}`, STATEMENT[1]];
        }
        return [SELECT, []];
    }


    protected async _query(SELECT: string, ORDER_BY_LIMIT: string, WHERE?: WhereParam, fixed = true): Promise<Static<S>[]> {
        const { BUILDER, EXECUTOR } = this;
        const [SQL, PARAM] = this.queryStatement(SELECT, ORDER_BY_LIMIT, BUILDER.where(WHERE), fixed);;
        const conn = await this.getConn();
        const result = await EXECUTOR.query(conn, SQL, PARAM);
        return result;
    }

    async all(): Promise<Static<S>[]> {
        const { BUILDER } = this;
        const ORDER_BY = BUILDER.orderBy(true);
        const result = await this._query(BUILDER.select(), ORDER_BY);
        return result;
    }


    async query(query?: QuerySchema): Promise<Static<S>[]> {
        const { BUILDER } = this;
        const where = BUILDER.convertQuery(query)
        const order = BUILDER.orderByLimit(query);
        const result = await this._query(BUILDER.select(), order, where);
        return result;
    }

    async queryPagination(query?: QuerySchema): Promise<{ total: number; list: Static<S>[]; }> {
        const { BUILDER, EXECUTOR } = this;
        const where = BUILDER.convertQuery(query)
        const count = BUILDER.count();
        const conn = await this.getConn();
        const list = await this.queryByCondition(where, query);
        // const total = await EXECUTOR.count(conn, count, where);
        return { list, total:100 }
    }

    async queryByField(field: string, value: string | number | boolean): Promise<Static<S>[]> {
        const { BUILDER, EXECUTOR } = this;
        const STATEMENT = BUILDER.byField(field, value);
        const ORDER_BY = BUILDER.orderBy(true);
        const [SQL, PARAM] = this.queryStatement(BUILDER.select(), ORDER_BY, STATEMENT);;
        const conn = await this.getConn();
        const result = await EXECUTOR.query(conn, SQL, PARAM);
        return result;
    }

    async queryByCondition(condition?: WhereParam, query: QuerySchema | boolean = true): Promise<Static<S>[]> {
        const { BUILDER } = this;
        const SELECT = BUILDER.select();
        const ORDER_BY_LIMIT = BUILDER.orderByLimit(query);
        return this._query(SELECT, ORDER_BY_LIMIT, condition);
    }


    async getById(id: string | number): Promise<Static<S>> {
        const { BUILDER, EXECUTOR } = this;
        const STATEMENT = BUILDER.byId(id);
        const SELECT = BUILDER.select(true);
        const [SQL, PARAM] = this.queryStatement(SELECT, '', STATEMENT);;
        const conn = await this.getConn();
        const result = await EXECUTOR.get(conn, SQL, PARAM);
        return result;
    }
    async getByField(field: string, value: string | number): Promise<Static<S>> {
        const { BUILDER, EXECUTOR } = this;
        const SELECT = BUILDER.select(true);
        const STATEMENT = BUILDER.byField(field, value);
        // const ORDER_BY = BUILDER.orderBy(true);
        const [SQL, PARAM] = this.queryStatement(SELECT, '', STATEMENT);;
        const conn = await this.getConn();
        const result = await EXECUTOR.get(conn, SQL, PARAM);
        return result;
    }
    async getByCondition(condition: WhereParam): Promise<Static<S>> {

        const { BUILDER, EXECUTOR } = this;
        const SELECT = BUILDER.select(true);
        const [SQL, PARAM] = this.queryStatement(SELECT, '', BUILDER.where(condition), false);;
        const conn = await this.getConn();
        const result = await EXECUTOR.get(conn, SQL, PARAM);
        return result;
    }
}