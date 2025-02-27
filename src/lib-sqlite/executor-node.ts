import { RETURN } from '../utils/types'
import { GLOBAL } from './Global';
import type { DatabaseSync, StatementResultingChanges } from 'node:sqlite'
// import type { Pool, QueryResult } from 'pg';

import type { QueryExecutor, ActionExecutor, } from '../core';

// null | number | bigint | string | Uint8Array;
class SqilteQuery implements QueryExecutor<DatabaseSync, object> {

    async query(conn: DatabaseSync, sql: string, params?: Array<string | number>): Promise<Array<object>> {
        if (GLOBAL.logSQL) GLOBAL.logSQL(sql, params);;
        let start = Date.now();
        const query = conn.prepare(sql);
        const result = query.all(...params)
        if (GLOBAL.logTime) {
            let now = Date.now();
            GLOBAL.logTime(sql, params, now - start);
        }
        return result as Array<object>;
    }

    async get(conn: DatabaseSync, sql: string, params?: Array<string | number>): Promise<object> {
        if (GLOBAL.logSQL) GLOBAL.logSQL(sql, params);;
        let start = Date.now();
        const stmt = conn.prepare(sql);
        const result = stmt.get(...params);
        // const stmt = conn.prepare('SELECT id FROM user where id = 991119');
        // const result = stmt.get();
        if (GLOBAL.logTime) {
            let now = Date.now();
            GLOBAL.logTime(sql, params, now - start);
        }
        return result as object;
    }
}

type Result = any;
type RESULT = StatementResultingChanges

// const stmt: StatementSync = null;
// stmt.sourceSQL

// stmt.get()
// stmt.iterate()
// stmt.bind() 


class SqliteExecutor extends SqilteQuery implements ActionExecutor<DatabaseSync, any, Result> {
    convert(result: Result, returning: RETURN = RETURN.COUNT) {
        switch (returning) {
            // case RETURN.ORIGIN:
            //     return result;
            // case RETURN.COUNT:
            //     return result.rowCount;
            // case RETURN.SUCCESS:
            //     return result.rowCount > 0;
            // case RETURN.KEY:

            // case RETURN.INFO:
            //     if (result.rows.length > 0) {
            //         return result.rows[0];
            //     }
            //     return null;;
            default:
                return result.rowCount;
        }
    }

    convertBatch(result: Result, returning: RETURN = RETURN.COUNT) {
        switch (returning) {
            case RETURN.ORIGIN:
                return result;
            case RETURN.COUNT:
                return result.rowCount;
            case RETURN.SUCCESS:
                return result.rowCount > 0;
            case RETURN.KEY:
            case RETURN.INFO:
                return result.rows as any;
            default:
                return result.rowCount;
        }
    }


    async execute(conn: DatabaseSync, sql: string, params?: Array<any>) {
        if (GLOBAL.logSQL) GLOBAL.logSQL(sql, params);;
        let start = Date.now();
        const stmt = conn.prepare(sql);
        let result = null;
        if (sql.indexOf('RETURNING') > 0) {
            result = stmt.all(...params);
        } else {
            result = stmt.run(...params);
        }
        if (GLOBAL.logTime) {
            let now = Date.now();
            GLOBAL.logTime(sql, params, now - start);
        }
        return result
    }



}


export const SQLITE_QUERY = new SqilteQuery();
export const SQLITE_EXECUTOR = new SqliteExecutor();