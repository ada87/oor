// https://github.com/TryGhost/node-sqlite3
import _ from 'lodash';
import { ShowSql } from '../../base/Provider/Util';
import { save } from './save';
import type { Database } from 'sql.js';
import type { SqlExecutor, } from '../../base/sql';


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
            var newId = null;
            stmt.bind();
            if (stmt.step()) newId = stmt.getAsObject().id;
            if (newId == null) throw new Error('Insert Error');
            let result = await save(db.export());
            if (!result) throw new Error('Save DB Error');
            return newId;
        } catch (e) {
            throw new Error(e);
        } finally {
            try {
                db.close();
            } catch {

            }
        }

    },

    get: async (db: Database, SQL: string, PARAM: any = []): Promise<any> => {
        log(SQL, PARAM);
        try {
            const stmt = db.prepare(SQL);
            if (PARAM && PARAM.length > 0) stmt.bind(PARAM);
            if (stmt.step()) {
                return stmt.getAsObject()
            }
            return null;
        } catch (e) {
            throw new Error(e);
        } finally {
            try {
                db.close();
            } catch {

            }
        }
    },

    query: async (db: Database, SQL: string, PARAM: any = []): Promise<any[]> => {
        log(SQL, PARAM);
        try {
            const stmt = db.prepare(SQL);
            if (PARAM && PARAM.length > 0) stmt.bind(PARAM);
            let result = [];
            while (stmt.step()) { //
                var row = stmt.getAsObject();
                result.push(row);
            }
            return result;
        } catch (e) {
            throw new Error(e);
        } finally {
            try {
                db.close();
            } catch {

            }
        }
    },

    execute: async (db: Database, SQL: string, PARAM: any = []): Promise<number> => {
        log(SQL, PARAM);
        try {
            db.run(SQL, PARAM);
            let effectedRows = db.getRowsModified();
            let result = await save(db.export());
            if (!result) throw new Error('Save DB Error');
            return effectedRows;
        } catch (e) {
            throw new Error(e);
        } finally {
            try {
                db.close();
            } catch {

            }
        }
    }
}
