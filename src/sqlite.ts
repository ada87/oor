/**
 * Requires NODE >= 22.5.0
 * https://nodejs.org/api/sqlite.html
 * */

import { DatabaseSync } from 'node:sqlite'
import { BaseDB, BaseError, ERROR_CODE } from './core'
import { DatabaseOptions, TableOptions, } from './core'

import type { DatabaseSyncOptions, } from 'node:sqlite';
import type { TObject } from '@sinclair/typebox'
import { SqliteTable, SqliteView } from './lib-sqlite/SqliteTable'
export { setSQLLogger, setSQLTimer } from './lib-sqlite/Global';
export { initFromFile, initFromSQL } from './lib-sqlite/initDB'


export type { Static, TSchema } from '@sinclair/typebox';   // export useful types from typebox
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


    Table<S extends TObject>(tbName: string, tbSchema: S, tbOptions?: TableOptions): SqliteTable<DatabaseSync, S> {
        return new SqliteTable(this, tbName, tbSchema, tbOptions);
    }

    View<S extends TObject>(tableName: string, tbSchema: S, tbOptions?: TableOptions): SqliteView<DatabaseSync, S> {
        return new SqliteView(this, tableName, tbSchema, tbOptions);
    }

}
export const SQLITE = new Sqlite(() => {
    if (process.env.SQLITE_PATH) return new DatabaseSync(process.env.SQLITE_PATH);
    throw new BaseError(ERROR_CODE.ENV_NOT_PROVIDED, { message: 'SQLITE_PATH not set' });
});
