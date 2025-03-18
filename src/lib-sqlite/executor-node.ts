import { ReturnType } from '../utils/types'
import { GLOBAL } from './Global';
import type { DatabaseSync, StatementResultingChanges } from 'node:sqlite'

import type { QueryExecutor, ActionExecutor, } from '../core';

export type Result = StatementResultingChanges | Array<any>;

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
        if (GLOBAL.logTime) {
            let now = Date.now();
            GLOBAL.logTime(sql, params, now - start);
        }
        return result as object;
    }
}




class SqliteExecutor extends SqilteQuery implements ActionExecutor<DatabaseSync, any, Result> {
    convert(result: Result, returnType: ReturnType = 'COUNT') {
        switch (returnType) {
            case 'ORIGIN':
                return result;
            case 'COUNT':
                return (result as StatementResultingChanges).changes;
            case 'SUCCESS':
                return (result as StatementResultingChanges).changes > 0;
            case 'KEY':
            case 'INFO':
                if ((result as Array<any>).length > 0) {
                    return result[0]
                }
                return null;;
            default:
                return (result as StatementResultingChanges).changes;
        }
    }

    convertBatch(result: Result, returnType: ReturnType = 'COUNT') {
        switch (returnType) {
            case 'ORIGIN':
                return result as any;
            case 'COUNT':
                return (result as StatementResultingChanges).changes;
            case 'SUCCESS':
                return (result as StatementResultingChanges).changes > 0;
            case 'KEY':
            case 'INFO':
                return result as Array<any>;
            default:
                return (result as StatementResultingChanges).changes;
        }
    }


    async execute(conn: DatabaseSync, sql: string, params?: Array<any>): Promise<Result> {
        if (GLOBAL.logSQL) GLOBAL.logSQL(sql, params);
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