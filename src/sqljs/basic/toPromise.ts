import type { Database, QueryExecResult, StatementIteratorResult, BindParams } from 'sql.js';

// type ExecResult = Pick<RunResult, 'lastID' | 'changes'>;

export const _exec = (db: Database, sql: string, param?: (string | number)[]) => new Promise<number>((r, j) =>{

    db.exec(sql,param);
    r(db.getRowsModified())


    // db.prepare(sql, function (err) {
    //     if (err != null) return j(err);
    
    //     if (param == null || param.length == 0) return this.run(function (err) {
    //         if (err) {
    //             j(err);
    //             return;
    
    //         }
    //         r({ lastID: this.lastID, changes: this.changes });
    //         this.finalize();
    //     });
    
    //     this.run(param, function (err) {
    //         if (err) {
    //             j(err);
    //             return;
    //         }
    //         r({ lastID: this.lastID, changes: this.changes });
    //         this.finalize();
    //     })
    
    
    // }));
});

export const _get = <T>(db: Database, sql: string, param?: (string | number)[]) => new Promise<T>((r, j) => {
    // const callback = (err: Error | null, obj: T) => {
    //     if (err) return j(err);
    //     r(obj);
    // }
    // const stmt = db.prepare(sql)
    if (param == null || param.length == 0) {
        const stmt = db.prepare(sql);
        const result = stmt.getAsObject();
        r(result as T);

        // db.get<T>(sql, callback)
    } else {
        const stmt = db.prepare(sql, param);
        const result = stmt.getAsObject(param);
        r(result as T);
    }
});


export const _query = <T>(db: Database, sql: string, param?: (string | number)[]) => new Promise<T[]>((r, j) => {
    // const callback = (err: Error | null, rows: T[]) => {
    //     if (err) {
    //         j(err);
    //         return;
    //     }
    //     r(rows);
    // }
    let result: QueryExecResult[] = (param == null || param.length == 0) ? db.exec(sql) : db.exec(sql, param)

    r(result.map(item => item.values) as T[])
    // r(result.values as T[])
    // result.columns
    // r()
});

