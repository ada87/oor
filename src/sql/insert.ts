import _ from 'lodash';
import type { ClientBase } from 'pg';

const _insert = (table: string, obj: any): [string, any[]] => {
    const fields = _.keys(obj);
    if (fields.length == 0) {
        throw new Error();
    }
    let query = [];
    let idx = [];
    let param = [];

    fields.map((field, i) => {
        let val = obj[field];
        if (val === null) {
            return
        }
        query.push(field)
        idx.push("$" + (i + 1));
        param.push(val)
    })
    return [`INSERT INTO ${table} (${query.join(',')}) VALUES (${idx.join(',')}) RETURNING *`, param];
}




export const insert = async (pg: ClientBase, table: string, obj: any): Promise<any> => {
    const [SQL, PARAM] = _insert(table, obj);
    const result = await pg.query(SQL, PARAM);
    if (result.rowCount == 1) {
        return result.rows[0];

    }
    throw new Error();
}


// export const insertBatch = async (pg: ClientBase, table: string, obj: any[]) => {

// }