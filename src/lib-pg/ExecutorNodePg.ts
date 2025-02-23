import { RETURN } from './../utils/types'

import type { Pool, QueryResult } from 'pg';
import type { QueryExecutor, ActionExecutor, } from '../core';


class PgQuery implements QueryExecutor<Pool, object> {

    async query(conn: Pool, sql: string, param?: Array<string | number | boolean | Date>): Promise<Array<object>> {
        const result = await conn.query(sql, param);
        return result.rows;
    }

    async get(conn: Pool, sql: string, param?: Array<string | number | boolean | Date>): Promise<object> {
        const result = await this.query(conn, sql, param);
        if (result == null || result.length == 0) return null;
        return result[0];
    }

}

class PgExecutor extends PgQuery implements ActionExecutor<Pool, any, QueryResult> {
    convert(result: QueryResult<any>, returning: RETURN = RETURN.COUNT) {
        switch (returning) {
            case RETURN.ORIGIN:
                return result;
            case RETURN.COUNT:
                return result.rowCount;
            case RETURN.SUCCESS:
                return result.rowCount > 0;
            case RETURN.KEY:

            case RETURN.INFO:
                if (result.rows.length > 0) {
                    return result.rows[0];
                }
                return null;;
            default:
                return result.rowCount;
        }
    }

    convertBatch(result: QueryResult<any>, returning: RETURN = RETURN.COUNT) {
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


    async execute(conn: Pool, sql: string, params?: Array<any>) {
        console.log(sql, params)
        const result = await conn.query(sql, params);
        return result
    }



}



export const PG_QUERY = new PgQuery();
export const PG_EXECUTOR = new PgExecutor();