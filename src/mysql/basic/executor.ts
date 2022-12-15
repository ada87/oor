import type { Pool } from 'mysql2/promise';
import type { SqlExecutor } from '../../base/sql';

import _ from 'lodash';
import { ShowSql } from '../../base/Util';

const log = (SQL: string, PARAM: any[]) => {
    if (ShowSql == null) return;
    ShowSql(`${SQL} | ${JSON.stringify(PARAM)}`)
}

export const executor: SqlExecutor<any> = {

    add: async (conn: Pool, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        const result = await conn.query(SQL, PARAM);


        // if (result.rowCount == 1) return result.rows[0];
        throw new Error();
    },

    get: async (conn: Pool, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        const result = await conn.query(SQL, PARAM);
        // if (result.rowCount > 0) return result.rows[0]
        return null;
    },

    query: async (conn: Pool, SQL: string, PARAM: any = []): Promise<any[]> => {
        log(SQL, PARAM);
        const [rows, fields] = await conn.query(SQL, PARAM);
        // console.log(rows)
        // console.log(fields)
        // return rows;
        return rows as any[];
    },

    execute: async (conn: Pool, SQL: string, PARAM: any = []): Promise<number> => {
        log(SQL, PARAM);
        // const result = await conn.query(SQL, PARAM);
        // return result.rowCount;
        return 1;
    },
}
