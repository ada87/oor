

    // export const select: SqlSelect = (table: string, fields: string = '*'): string => `SELECT ${fields || '*'} FROM ${table} `;

    // export const count: SqlCount = (table: string) => `SELECT count(0) AS total FROM ${table}`;

    // export const insert: SqlInsert = (table: string, obj: any): [string, any[]] => {
    //     const fields = _.keys(obj);
    //     if (fields.length == 0) {
    //         throw new Error();
    //     }
    //     let query = [];
    //     let idx = [];
    //     let param = [];

    //     fields.map((field, i) => {
    //         let val = obj[field];
    //         if (val === null) {
    //             return
    //         }
    //         query.push(field)
    //         idx.push("$" + (i + 1));
    //         param.push(val)
    //     })
    //     return [`INSERT INTO ${table} (${query.join(',')}) VALUES (${idx.join(',')}) RETURNING *`, param];
    // }

    // export const update: SqlUpdate = (table: string, obj: any, key = 'id'): [string, any[]] => {
    //     const fields = _.keys(obj);
    //     if (fields.length == 0) throw new Error();
    //     let query = [];
    //     let param = [];

    //     let diff = 1;
    //     fields.map((field, i) => {
    //         // Not Allow Update Primary Key
    //         if (field == key) {
    //             diff = 0;
    //             return;
    //         }
    //         let val = obj[field];
    //         query.push(`${field} = $${i + diff}`)
    //         param.push(val)
    //     });
    //     // console.log(`UPDATE  ${table} SET ${query.join(',')} RETURNING *`)

    //     return [`UPDATE  ${table} SET ${query.join(',')}`, param];
    // }

    // export const del: SqlDelete = (table: string): string => `DELETE FROM ${table} `





    // export const byField: SqlByField = (field: string, id: string | number, startIdx: number = 1) => [` ${field} = $${startIdx} `, [id]];
