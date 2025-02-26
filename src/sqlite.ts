/**
 * Requires NODE >= 22.5.0
 * https://nodejs.org/api/sqlite.html
 * */

import { DatabaseSync, } from 'node:sqlite'
import { BaseDB } from './core'
import { DatabaseOptions } from './core'

import type { DatabaseSyncOptions, } from 'node:sqlite';

export { initFromFile, initFromSQL } from './lib-sqlite/initDB'
export type { Static, TSchema } from '@sinclair/typebox';   // export useful types from typebox
export { setSQLLogger, setSQLTimer } from './lib-pg/Global';
export * from './utils/types';

export type SqliteOptions = string | DatabaseOptions & { location: string; } | (() => DatabaseSync);


export class Sqlite extends BaseDB<SqliteOptions, DatabaseSync> {
    protected client: DatabaseSync;

    async getConn(): Promise<DatabaseSync> {
        if (this.client != null) return this.client;
        if (typeof this.config == 'string') {
            this.client = new DatabaseSync(this.config);
        } else if (typeof this.config == 'function') {
            this.client = this.config();
        } else {
            this.client = new DatabaseSync(this.config.location, this.config as DatabaseSyncOptions);
        }

        return this.client;
    }

    View() {

    }
    Table() {

    }

}
export const SQLITE = new Sqlite(() => {
    if (process.env.SQLITE_PATH) return new DatabaseSync(process.env.SQLITE_PATH);
    throw new Error(`SQLITE_PATH not set`);
});
