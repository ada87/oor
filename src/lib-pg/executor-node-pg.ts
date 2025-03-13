import { GLOBAL } from './Global';

import type { Pool, QueryResult } from 'pg';
import type { ReturnType } from '../utils/types';
import type { QueryExecutor, ActionExecutor, } from '../core';

class PgQuery implements QueryExecutor<Pool, object> {

    async query(conn: Pool, sql: string, params?: Array<string | number | boolean | Date>): Promise<Array<object>> {
        if (GLOBAL.logSQL) GLOBAL.logSQL(sql, params);;
        let start = Date.now();
        const result = await conn.query(sql, params);
        if (GLOBAL.logTime) {
            let now = Date.now();
            GLOBAL.logTime(sql, params, now - start);
        }
        return result.rows;
    }

    async get(conn: Pool, sql: string, param?: Array<string | number | boolean | Date>): Promise<object> {
        const result = await this.query(conn, sql, param);
        if (result == null || result.length == 0) return null;
        return result[0];
    }
}

class PgExecutor extends PgQuery implements ActionExecutor<Pool, any, QueryResult> {
    convert(result: QueryResult<any>, returning: ReturnType = 'COUNT') {
        switch (returning) {
            case 'ORIGIN':
                return result;
            case 'COUNT':
                return result.rowCount;
            case 'SUCCESS':
                return result.rowCount > 0;
            case 'KEY':
            case 'INFO':
                if (result.rows.length > 0) {
                    return result.rows[0];
                }
                return null;;
            default:
                return result.rowCount;
        }
    }

    convertBatch(result: QueryResult<any>, returning: ReturnType = 'COUNT') {
        switch (returning) {
            case 'ORIGIN':
                return result;
            case 'COUNT':
                return result.rowCount;
            case 'SUCCESS':
                return result.rowCount > 0;
            case 'KEY':
            case 'INFO':
                return result.rows as any;
            default:
                return result.rowCount;
        }
    }

    async execute(conn: Pool, sql: string, params?: Array<any>) {
        if (GLOBAL.logSQL) GLOBAL.logSQL(sql, params);;
        let start = Date.now();
        const result = await conn.query(sql, params);
        if (GLOBAL.logTime) {
            let now = Date.now();
            GLOBAL.logTime(sql, params, now - start);
        }
        return result
    }
}

export const PG_QUERY = new PgQuery();
export const PG_EXECUTOR = new PgExecutor();