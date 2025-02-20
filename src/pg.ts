// npm i pg @types/pg
import { Pool } from 'pg'
import { BaseDB } from './core/BaseDB';
import { PgTable } from './lib-pg/PgTable';
import { PgView } from './lib-pg/PgView'

// https://www.postgresql.org/docs/17/sql-select.html
import type { PoolConfig } from 'pg';
import type { TableOptions } from './core';
import type { TObject } from '@sinclair/typebox';

export * from './utils/types';

export class PgPool extends BaseDB<PoolConfig | (() => Pool | Promise<Pool>), Pool> {
    private pool: Pool = null;

    override async getConn(): Promise<Pool> {
        if (this.pool == null) {
            if (typeof this.config == 'function') {
                this.pool = await Promise.resolve(this.config.call(null));
            } else {
                this.pool = new Pool(this.config);
            }

            await this.pool.connect()
        }
        return this.pool;
    }



    Table<S extends TObject>(tbName: string, tbSchema: S, tbOptions?: TableOptions): PgTable<Pool, S> {
        return new PgTable(this, tbName, tbSchema, tbOptions);
    }

    View<S extends TObject>(tableName: string, tbSchema: S, tbOptions?: TableOptions): PgView<Pool, S> {
        return new PgView(this, tableName, tbSchema, tbOptions);
    }
}


export const PG = new PgPool(() => {
    let config: PoolConfig = {};

    try {
        config.host = process.env.PG_HOST;
        config.port = parseInt(process.env.PG_PORT);
        config.user = process.env.PG_USER;
        config.database = process.env.PG_DB;
        config.password = process.env.PG_PASS;
    } catch (error) {
        throw (error)
    }

    return new Pool(config);
})


// pg @types/pg
// postgres
// mysql2
// @libsql/client
// better-sqlite3 @types/better-sqlite3