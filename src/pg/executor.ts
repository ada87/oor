import type { ClientBase } from 'pg';
import type { SqlExecutor } from '../base/sql';

import _ from 'lodash';
import { ShowSql } from '../base/Util';

const log = (SQL: string, PARAM: any[]) => {
    if (ShowSql == null) return;
    ShowSql(SQL, PARAM)
}

export const executor: SqlExecutor<any> = {

    add: async (conn: ClientBase, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        const result = await conn.query(SQL, PARAM);
        if (result.rowCount == 1) return result.rows[0];
        throw new Error();
    },

    get: async (conn: ClientBase, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        const result = await conn.query(SQL, PARAM);
        if (result.rowCount > 0) return result.rows[0]
        return null;
    },

    query: async (conn: ClientBase, SQL: string, PARAM: any = []): Promise<any[]> => {
        log(SQL, PARAM);
        const result = await conn.query(SQL, PARAM);
        return result.rows;
    },

    execute: async (conn: ClientBase, SQL: string, PARAM: any = []): Promise<number> => {
        log(SQL, PARAM);
        const result = await conn.query(SQL, PARAM);
        return result.rowCount;
    },
}
