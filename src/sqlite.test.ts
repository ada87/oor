import { test } from 'tsest'
import _ from 'lodash'
import { existsSync } from 'fs'
import { isAbsolute, resolve } from 'path';

// import { initFromSQL } from './lib-sqlite/initDB'


import {
    DatabaseSync,
    // SQLITE_CHANGESET_OMIT,
} from 'node:sqlite'
import type {
    SupportedValueType,
    DatabaseSyncOptions,
    StatementResultingChanges,
    Session, CreateSessionOptions, ApplyChangesetOptions, FunctionOptions
} from 'node:sqlite';

test('sqlite', async () => {
    // const dbPath = './oor.db';
    // const filePath = isAbsolute(dbPath) ? dbPath : resolve(process.cwd(), dbPath);
    // // console.log(filePath)
    // if (!existsSync(filePath)) throw ('file not exists');
    // const db = new DatabaseSync(filePath);
    // console.log(db)
    // db.exec(`CREATE TABLE data(key INTEGER PRIMARY KEY, value TEXT)`);
    // const insert = db.prepare('INSERT INTO data (key, value) VALUES (?, ?)');
    // insert.run(2, 'hello');

    // const result = db.exec(`SELECT * FROM data ORDER BY key`);
    // console.log(result)

    // const query = db.prepare('SELECT * FROM data ORDER BY key');
    // // Execute the prepared statement and log the result set.
    // console.log(query.all());
    // Prints: [ { key: 1, value: 'he


    // const SQLITE = new Sqlite({ location: 'test.db' });
    // console.log('fdsa')
    // const db = new DatabaseSync('test.db');
})