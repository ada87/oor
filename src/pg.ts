// npm i pg @types/pg
// https://github.com/brianc/node-postgres
// https://www.postgresql.org/docs/17/sql-select.html
import { Pool } from 'pg'
import { parsePort } from './utils/ValidateUtil'
import { BaseDB } from './core/BaseDB';
import { BaseError, ERROR_CODE } from './core/BaseError';
import { PgView, PgTable, } from './lib-pg/PgTable';


import type { PoolConfig } from 'pg';
import type { TableOptions, DatabaseOptions, Database } from './core';
import type { TObject, } from '@sinclair/typebox';          // export useful types from typebox
export type { Static, TSchema, TObject } from '@sinclair/typebox';

export { setSQLLogger, setSQLTimer } from './lib-pg/Global';
export * from './utils/types';


type CustomView<S extends TObject, T extends PgView<Pool, S> = PgView<Pool, S>> = {
    new(db: Database<Pool>, tableName: string, schema: S, tbOptions?: TableOptions, dbOptions?: DatabaseOptions): T
};

type CustomTable<S extends TObject, T extends PgTable<Pool, S> = PgTable<Pool, S>> = {
    new(db: Database<Pool>, tableName: string, schema: S, tbOptions?: TableOptions, dbOptions?: DatabaseOptions): T
};
export class Table<S extends TObject> extends PgTable<Pool, S> { }
export class View<S extends TObject> extends PgView<Pool, S> { }

export class PostgreSQL extends BaseDB<PoolConfig | (() => Pool | Promise<Pool>), Pool> {
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



    Table<S extends TObject, C extends PgTable<Pool, S> = PgTable<Pool, S>>(tbName: string, tbSchema: S, tbOptions?: TableOptions, P?: CustomTable<S, C>): C {
        if (P) {
            return new P(this, tbName, tbSchema, tbOptions);
        }
        return new PgTable(this, tbName, tbSchema, tbOptions) as C;
    }

    View<S extends TObject, C extends PgView<Pool, S> = PgView<Pool, S>>(tableName: string, tbSchema: S, tbOptions?: TableOptions, P?: CustomView<S, C>): C {
        if (P) {
            return new P(this, tableName, tbSchema, tbOptions);
        }
        return new PgView(this, tableName, tbSchema, tbOptions) as C;
    }
}

/**
 * A Quick PG Database Provider.
 * For use , must set local environment variables :
 * 
 * - PG_URL
 *  OR
 * - PG_HOST (REQUIRED)
 * - PG_PORT        (DEFAULT: 5432)
 * - PG_USER
 * - PG_PASS
 * - PG_DB   (REQUIRED)
*/
export const PG = new PostgreSQL(() => {
    if (process.env.PG_URL) return new Pool({ connectionString: process.env.PG_URL });

    let config: PoolConfig = {};

    if (process.env.PG_HOST) {
        config.host = process.env.PG_HOST;
    } else {
        throw new BaseError(ERROR_CODE.ENV_NOT_PROVIDED, { message: 'PG_HOST is required' })
    }

    if (process.env.PG_PORT) {
        let port = parsePort(process.env.PG_PORT);
        if (port == false) {
            throw new BaseError(ERROR_CODE.ENV_NOT_PROVIDED, { message: 'PG_PORT is not a valid port' })
        }
        config.port = port;
    } else {
        config.port = 5432;
    }
    if (process.env.PG_DB) {
        config.database = process.env.PG_DB;
    } else {
        throw new BaseError(ERROR_CODE.ENV_NOT_PROVIDED, { message: 'PG_DB is required' })
    }
    if (process.env.PG_USER) {
        config.user = process.env.PG_USER;
        if (process.env.PG_PASS) config.password = process.env.PG_PASS;
    }


    return new Pool(config);
})