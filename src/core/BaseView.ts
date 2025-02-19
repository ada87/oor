import { BaseQuery } from './BaseDB';


import type { DatabaseOptions, TableOptions, QueryBuilder, QueryExecutor, Database, View } from './types'
import type { TObject, Static } from '@sinclair/typebox';
import type { WhereParam, SQLStatement, QuerySchema, OrderBy } from '../utils/types';

type Provider<B extends QueryBuilder> = {
    new(tableName: string, schema: TObject, tbOptions?: TableOptions, dbOptions?: DatabaseOptions): B
};


export abstract class BaseView<C, S extends TObject, B extends QueryBuilder> extends BaseQuery<C> implements View<Static<S>> {

    protected readonly BUILDER: B;

    protected abstract readonly EXECUTOR: QueryExecutor<C, Static<S>>;

    /**
     * @param tableName Data table name, "${schemaName}.${tableName}"  
     *  "${schemaName}." can be ignore with the default search_path.
     * @param schema The Object Schema, oor will not validate the value
     * @param options (Table/View) Options
     */
    constructor(p: Provider<B>, db: Database<C>, tbName: string, tbSchema: S, tbOptions?: TableOptions) {
        super(db);
        const dbOptions = db.getOption();
        this.BUILDER = new p(tbName, tbSchema, tbOptions, dbOptions);

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

    protected async _query(SELECT: string, ORDERBY_LIMIT?: string, WHERE?: WhereParam, fixed = true): Promise<Static<S>[]> {
        const { BUILDER, EXECUTOR } = this;
        const [SQL, PARAM] = this.queryStatement(SELECT, ORDERBY_LIMIT, BUILDER.where(WHERE), fixed);;
        const conn = await this.getConn();
        const result = await EXECUTOR.query(conn, SQL, PARAM);
        return result;
    }

    async all(sort?: OrderBy): Promise<Static<S>[]> {
        const { BUILDER } = this;
        let orderBy = sort ? BUILDER.orderBy(sort) : '';
        const result = await this._query(BUILDER.select(), orderBy);
        return result
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
        const total = await EXECUTOR.count(conn, count, where);
        return { list, total }
    }

    async queryByField(field: string, value: string | number | boolean): Promise<Static<S>[]> {
        const { BUILDER } = this;
        const WHERE = BUILDER.byField(field, value);
        const result = await this.queryByCondition(WHERE);
        return result;
    }

    async queryByCondition(condition?: WhereParam, query?: QuerySchema): Promise<Static<S>[]> {
        const { BUILDER } = this;
        const SELECT = BUILDER.select();
        if (query) {
            const ORDER_BY_LIMIT = BUILDER.orderByLimit(query);
            return this._query(SELECT, ORDER_BY_LIMIT, condition);
        }
        return this._query(SELECT, '', condition);
    }


    getById: (id: string | number) => Promise<Static<S>>;
    getByField: (field: string, value: string | number) => Promise<Static<S>>;
    getByCondition: (condition: WhereParam) => Promise<Static<S>>;


}






// private async _query(WHERE, PARAM: ArrayLike<string | number | boolean> = [], ORDER_BY = '', LIMIT = ''): Promise<Static<S>[]> {
//     // const { BUILDER, EXECUTOR, _table, _CONFIG: { fields_query } } = this;
//     // const SQL_QUERY = _BUILDER.select(_table, fields_query);
//     // const SQL = `${SQL_QUERY} ${WHERE} ${ORDER_BY} ${LIMIT}`;
//     // const conn = await this.getConn();
//     // const result = _EXECUTOR.query(conn, SQL, PARAM)
//     // return result;
//     return []
// }

// protected async _get(SQL: string, whereParam?: WhereParam, fixed = false) {
//     const { BUILDER, EXECUTOR } = this;
// }

// async getById(id: string | number) {
//     const { BUILDER, EXECUTOR } = this;
//     const SQL = BUILDER.select();
//     const [_WHERE, _PARAM] = BUILDER.byId(id);
//     // const conn = await this.getConn();
//     const [WHERE, PARAM] = BUILDER.fixWhere(_WHERE, _PARAM);
//     const result = await EXECUTOR.get(conn, `${SQL} ${WHERE}`, PARAM);

//     return result;
// }

// async getByField(field: string, value: string | number): Promise<Static<S>> {
//     const { BUILDER, EXECUTOR } = this;
//     const SQL = BUILDER.select();
//     const [_WHERE, _PARAM] = BUILDER.byField(field, value);
//     const [WHERE, PARAM] = BUILDER.fixWhere(_WHERE, _PARAM);
//     const conn = await this.getConn()
//     const result = await EXECUTOR.get(conn, `${SQL} ${WHERE}`, PARAM);
//     return result;
// }

// async getByCondition(condition: WhereParam): Promise<Static<S>> {
//     const { BUILDER, EXECUTOR } = this;
//     const SQL = BUILDER.select();
//     const [_WHERE, _PARAM] = BUILDER.where(condition);
//     const [WHERE, PARAM] = BUILDER.fixWhere(_WHERE, _PARAM);
//     const conn = await this.getConn()
//     const result = await EXECUTOR.get(conn, `${SQL} ${WHERE}`, PARAM);
//     return result;
// }