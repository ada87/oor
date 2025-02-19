import { BaseQuery, } from './BaseDB';
import _ from 'lodash';

import type { Database } from './BaseDB';
import type { DatabaseOptions, TableOptions, QueryBuilder, QueryExecutor } from './types'
import type { TObject, Static } from '@sinclair/typebox';
import type { WhereParam, QuerySchema } from '../utils/types';


type Provider<B extends QueryBuilder> = {
    new(tableName: string, schema: TObject, tbOptions?: TableOptions, dbOptions?: DatabaseOptions): B
};



export interface View<O extends object> {
    // readonly tableName: string;

    all: () => Promise<Array<O>>;
    getById: (id: string | number) => Promise<O>
    getByField: (field: string, value: string | number | Date) => Promise<O>;
    getByCondition: (condition: WhereParam) => Promise<O>;
    query: {
        (): Promise<Array<O>>
        (query: QuerySchema): Promise<Array<O>>,
    };
    queryPagination: (query?: QuerySchema) => Promise<{ total: number, list: Array<O> }>
    queryByField: (field: string, value?: string | number | boolean) => Promise<Array<O>>;
    queryByCondition: (condition?: WhereParam, query?: QuerySchema) => Promise<Array<O>>;
}

export abstract class BaseView<C, S extends TObject, B extends QueryBuilder> extends BaseQuery<C> implements View<Static<S>> {


    protected readonly BUILDER: B;

    private readonly STRICT_QUERY: boolean = false;

    protected abstract readonly EXECUTOR: QueryExecutor<C, Static<S>>;

    /**
     * @param tableName Data table name, "${schemaName}.${tableName}"  
     *  "${schemaName}." can be ignore with the default search_path.
     * @param schema The Object Schema, oor will not validate the value
     * @param options (Table/View) Options
     */
    constructor(p: Provider<B>, db: Database<C>, tbName: string, tbSchema: S, tbOptions?: TableOptions) {
        super(db);
        const dbOptions = db.getOptions();
        this.BUILDER = new p(tbName, tbSchema, tbOptions, dbOptions);
        this.STRICT_QUERY = tbOptions?.strictQuery || dbOptions?.strictQuery || false;
        this.init();
    }

    protected init() { };

    // protected _preload(db: Database<C>, tableName: string, schema: S, options?: TableOptions) {
    //     this.BUILDER = new BaseQueryBuilder(tableName, schema, options, db.getOptions());
    // }



    async all(): Promise<Static<S>[]> {
        const { BUILDER, EXECUTOR } = this;
        const SQL = BUILDER.select();
        const [WHERE, PARAM] = BUILDER.fixWhere();
        const conn = await this.getConn();
        const result = await EXECUTOR.query(conn, `${SQL} ${WHERE}`, PARAM);
        return result;
    }

    async getById(id: string | number) {
        const { BUILDER, EXECUTOR } = this;
        const SQL = BUILDER.select();
        const [_WHERE, _PARAM] = BUILDER.byId(id);
        const conn = await this.getConn();
        const [WHERE, PARAM] = BUILDER.fixWhere(_WHERE, _PARAM);
        const result = await EXECUTOR.get(conn, `${SQL} ${WHERE}`, PARAM);
        return result;
    }

    async getByField(field: string, value: string | number): Promise<Static<S>> {
        const { BUILDER, EXECUTOR } = this;
        const SQL = BUILDER.select();
        const [_WHERE, _PARAM] = BUILDER.byField(field, value);
        const [WHERE, PARAM] = BUILDER.fixWhere(_WHERE, _PARAM);
        const conn = await this.getConn()
        const result = await EXECUTOR.get(conn, `${SQL} ${WHERE}`, PARAM);
        return result;
    }

    async getByCondition(condition: WhereParam): Promise<Static<S>> {
        const { BUILDER, EXECUTOR } = this;

        const SQL = BUILDER.select();
        const [_WHERE, _PARAM] = BUILDER.where(condition);
        const [WHERE, PARAM] = BUILDER.fixWhere(_WHERE, _PARAM);

        const conn = await this.getConn()
        const result = await EXECUTOR.get(conn, `${SQL} ${WHERE}`, PARAM);
        return result;
    }

    private async _query(WHERE, PARAM: ArrayLike<string> = [], ORDER_BY = '', LIMIT = ''): Promise<Static<S>[]> {
        // const { BUILDER, EXECUTOR, _table, _CONFIG: { fields_query } } = this;
        // const SQL_QUERY = _BUILDER.select(_table, fields_query);
        // const SQL = `${SQL_QUERY} ${WHERE} ${ORDER_BY} ${LIMIT}`;
        // const conn = await this.getConn();
        // const result = _EXECUTOR.query(conn, SQL, PARAM)
        // return result;
        return []
    }


    async query(): Promise<Static<S>[]> {
        const { BUILDER, EXECUTOR } = this;
        return null;
    }

    async queryPagination(query?: QuerySchema): Promise<{ total: number; list: Static<S>[]; }> {
        const { BUILDER, EXECUTOR } = this;
        return null;
    }

    async queryByField(field: string, value?: string | number | boolean): Promise<Static<S>[]> {
        const { BUILDER, EXECUTOR } = this;
        return null;
    }

    async queryByCondition(condition?: WhereParam, query?: QuerySchema): Promise<Static<S>[]> {
        const { BUILDER, EXECUTOR } = this;
        return null;
    }


}