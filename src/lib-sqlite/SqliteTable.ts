import _ from '../core/dash';
import { BaseView, BaseTable } from '../core'
import { SqliteQuery } from './SqliteQuery';
import { SQLITE_QUERY, SQLITE_EXECUTOR } from './executor-node'

import type { QueryResult } from 'pg';
import type { Database, TableOptions, QueryExecutor, ActionExecutor } from '../core'
import type { TObject } from '@sinclair/typebox';


import type { ClientBase, Pool } from 'pg';


export class PgView<C, S extends TObject> extends BaseView<C, S, SqliteQuery> {
    protected EXECUTOR = SQLITE_QUERY as QueryExecutor<C, any>;

    constructor(db: Database<C>, tableName: string, tableSchema: S, tableOptions?: TableOptions) {
        super(SqliteQuery, db, tableName, tableSchema, tableOptions);
    }

    /**
     * same arguments as pg.query()
     * */
    sql: ClientBase['query'] = async (...args: any[]) => {
        const conn = await this.getConn() as ClientBase;
        return conn.query.call(conn, ...args);
    }


}


export class PgTable<C, S extends TObject> extends BaseTable<C, S, SqliteQuery> {


    protected EXECUTOR = SQLITE_EXECUTOR as ActionExecutor<C, any, QueryResult>;

    constructor(db: Database<C>, tableName: string, tableSchema: S, tableOptions?: TableOptions) {
        super(SqliteQuery, db, tableName, tableSchema, tableOptions);
    }
}