import _ from 'lodash';
import { ShowSql } from '../../base/Util';
// https://github.com/TryGhost/node-sqlite3
import type { Database, QueryExecResult } from 'sql.js';
import type { SqlExecutor, } from '../../base/sql';

// import { _exec, _get, _query } from './toPromise';

const log = (SQL: string, PARAM: any[]) => {
    if (ShowSql == null) return;
    ShowSql(`${SQL} | ${JSON.stringify(PARAM)}`)
}

export const executor: SqlExecutor<any> = {

    add: async (db: Database, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        try {
            db.run(SQL, PARAM);
            let effectedRows = db.getRowsModified();
            if (effectedRows == 0) throw new Error('Insert Error');
            const stmt = db.prepare(`SELECT last_insert_rowid() AS id;`);
            var newId = stmt.getAsObject();
            return newId.id;
        } catch (e) {
            throw new Error(e);
        }

    },

    get: async (db: Database, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        const stmt = db.prepare(SQL);
        if (PARAM && PARAM.length > 0) stmt.bind(PARAM);
        return stmt.getAsObject();
    },

    query: async (db: Database, SQL: string, PARAM: any = []): Promise<any[]> => {
        log(SQL, PARAM);
        const stmt = db.prepare(SQL);
        if (PARAM && PARAM.length > 0) stmt.bind(PARAM);
        let result = [];
        while (stmt.step()) { //
            var row = stmt.getAsObject();
            result.push(row);
        }
        return result;

    },

    execute: async (db: Database, SQL: string, PARAM: any = []): Promise<number> => {
        log(SQL, PARAM);
        db.run(SQL, PARAM);
        let effectedRows = db.getRowsModified();
        // fs.writeFileSync(DATABASE, db.export());
        return effectedRows;
    },
}
