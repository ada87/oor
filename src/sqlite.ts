/**
 * Requires NODE >= 22.5.0
 * https://nodejs.org/api/sqlite.html
 * */ 

import {
    StatementSync,
    DatabaseSync,
    // SQLITE_CHANGESET_OMIT,
} from 'node:sqlite'
import type {
    SupportedValueType,
    DatabaseSyncOptions,
    StatementResultingChanges,
    Session, CreateSessionOptions, ApplyChangesetOptions, FunctionOptions

} from 'node:sqlite';

import { BaseDB } from './core'
import { DatabaseOptions } from './core'

type SqliteOptions = string | DatabaseOptions & { location: string; } | (() => DatabaseSync);


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

const SQLITE = new Sqlite({ location: 'test.db' });

const test = async () => {
    const db = await SQLITE.getConn();
    db.exec(`CREATE TABLE data(key INTEGER PRIMARY KEY, value TEXT)`);
    const insert = db.prepare('INSERT INTO data (key, value) VALUES (?, ?)');
    insert.run(1, 'hello');
    insert.run(2, 'world');
    const query = db.prepare('SELECT * FROM data ORDER BY key');
    console.log(query.all());
}
