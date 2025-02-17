import _ from 'lodash';
import { ShowSql } from '../../base/Util';
// https://github.com/TryGhost/node-sqlite3
import type { Database } from 'sqlite3';
import type { SqlExecutor, } from '../../base/sql';

import { _exec, _get, _query } from './toPromise';

const log = (SQL: string, PARAM: any[]) => {
    if (ShowSql == null) return;
    ShowSql(`${SQL} | ${JSON.stringify(PARAM)}`)
}

export const executor: SqlExecutor<any> = {

    add: async (db: Database, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        try {
            const result = await _exec(db, SQL, PARAM)
            if (result.changes == 1) {
                return result.lastID;
            }
            throw new Error('Insert Error')
        } catch (e) {
            throw new Error(e);
        }

    },

    get: async (db: Database, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        return await _get(db, SQL, PARAM);
    },

    query: async (db: Database, SQL: string, PARAM: any = []): Promise<any[]> => {
        log(SQL, PARAM);
        return await _query(db, SQL, PARAM);
    },

    execute: async (db: Database, SQL: string, PARAM: any = []): Promise<number> => {
        log(SQL, PARAM);
        const result = await _exec(db, SQL, PARAM)
        return result.changes;
    },
}
