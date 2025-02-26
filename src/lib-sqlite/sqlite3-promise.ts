import type { Database, RunResult } from 'sqlite3';

type ExecResult = Pick<RunResult, 'lastID' | 'changes'>;

// export const _run = (db:Database)=>{
// db.run('')
// }

export const _exec = (db: Database, sql: string, param?: (string | number)[]) => new Promise<ExecResult>((r, j) => db.prepare(sql, function (err) {
    if (err != null) return j(err);

    if (param == null || param.length == 0) return this.run(function (err) {
        if (err) {
            j(err);
            return;

        }
        r({ lastID: this.lastID, changes: this.changes });
        this.finalize();
    });

    this.run(param, function (err) {
        if (err) {
            j(err);
            return;
        }
        r({ lastID: this.lastID, changes: this.changes });
        this.finalize();
    })


}));

export const _get = <T>(db: Database, sql: string, param?: (string | number)[]) => new Promise<T>((r, j) => {
    const callback = (err: Error | null, obj: T) => {
        if (err) return j(err);
        r(obj);
    }
    if (param == null || param.length == 0) {
        db.get<T>(sql, callback)
    } else {
        db.get<T>(sql, param, callback)
    }
});


export const _query = <T>(db: Database, sql: string, param?: (string | number)[]) => new Promise<T[]>((r, j) => {
    const callback = (err: Error | null, rows: T[]) => {
        if (err) {
            j(err);
            return;
        }
        r(rows);
    }
    if (param == null || param.length == 0) {
        db.all<T>(sql, callback)
    } else {
        db.all<T>(sql, param, callback)
    }
});

