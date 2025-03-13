import _ from '../core/dash';
import { BaseView, BaseTable } from '../core'
import { PgQuery } from './PgSQL';
import { PG_QUERY, PG_EXECUTOR } from './executor-node-pg'

import type { ClientBase, QueryResult } from 'pg';
import type { Database, TableOptions, QueryExecutor, ActionExecutor } from '../core'
import type { TObject } from '@sinclair/typebox';


export class PgView<C, S extends TObject> extends BaseView<C, S, PgQuery> {
    protected EXECUTOR = PG_QUERY as QueryExecutor<C, any>;

    constructor(db: Database<C>, tableName: string, tableSchema: S, tableOptions?: TableOptions) {
        super(PgQuery, db, tableName, tableSchema, tableOptions);
    }

    /**
     * same arguments as pg.query()
     * */
    sql: ClientBase['query'] = async (...args: any[]) => {
        const conn = await this.getConn() as ClientBase;
        return conn.query.call(conn, ...args);
    }


}


export class PgTable<C, S extends TObject> extends BaseTable<C, S, PgQuery> {


    protected EXECUTOR = PG_EXECUTOR as ActionExecutor<C, any, QueryResult>;

    constructor(db: Database<C>, tableName: string, tableSchema: S, tableOptions?: TableOptions) {
        super(PgQuery, db, tableName, tableSchema, tableOptions);
    }
}