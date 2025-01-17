import _ from 'lodash';
import { ShowSql } from '../../base/Util';

import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { SqlExecutor, } from '../../base/sql';

const log = (SQL: string, PARAM: any[]) => {
    if (ShowSql == null) return;
    ShowSql(`${SQL} | ${JSON.stringify(PARAM)}`)
}

export const executor: SqlExecutor<any> = {

    add: async (pool: Pool, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        const conn = await pool.getConnection();
        try {
            const addResult = await conn.query<ResultSetHeader>(SQL, PARAM);
            if (addResult[0] && addResult[0].affectedRows == 1) {
                const [lastResult] = await conn.query<RowDataPacket['id'][number]>(`SELECT LAST_INSERT_ID() as id;`);
                return lastResult[0];
            }
            throw new Error('Insert Error')
        } catch (e) {
            throw new Error(e);
        } finally {
            conn.release();
        }

    },

    get: async (conn: Pool, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        const [rows] = await conn.query<any[]>(SQL, PARAM);
        if (rows.length > 0) return rows[0]
        return null;
    },

    query: async (conn: Pool, SQL: string, PARAM: any = []): Promise<any[]> => {
        log(SQL, PARAM);
        const [rows] = await conn.query<any[]>(SQL, PARAM);
        return rows as any[];
    },

    execute: async (conn: Pool, SQL: string, PARAM: any = []): Promise<number> => {
        log(SQL, PARAM);
        const result = await conn.query<ResultSetHeader>(SQL, PARAM);
        return result[0].affectedRows;
    },
}
