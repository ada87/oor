// npm i pg @types/pg
import { Pool } from 'pg'
import { BaseDB } from './core/BaseDB';
import { PgTable } from './lib-pg/PgTable';
import { PgView } from './lib-pg/PgView'

// https://www.postgresql.org/docs/17/sql-select.html
import type { PoolConfig } from 'pg';
import type { TableOptions } from './core';
import type { TObject, } from '@sinclair/typebox';
export type { Static } from '@sinclair/typebox';

export { setSQLLogger, setSQLTimer } from './lib-pg/Global';
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
export const PG = new PgPool(() => {
    if (process.env.PG_URL) return new Pool({ connectionString: process.env.PG_URL });

    let config: PoolConfig = {};
    try {

        if (process.env.PG_HOST) {
            config.host = process.env.PG_HOST;
        } else {
            throw new Error('PG_HOST is required')
        }

        if (process.env.PG_PORT) {
            config.port = parseInt(process.env.PG_PORT);
        } else {
            config.port = 5432;
        }
        if (process.env.PG_DB) {
            config.database = process.env.PG_DB;
        } else {
            throw new Error('PG_DB is required')
        }
        if (process.env.PG_USER) {
            config.user = process.env.PG_USER;
            if (process.env.PG_PASS) config.password = process.env.PG_PASS;
        }

    } catch (error) {
        throw (error)
    }

    return new Pool(config);
})