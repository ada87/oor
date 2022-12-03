import _ from 'lodash';
import { SqlInsert } from '../../base/sql';

export const insert: SqlInsert = (table: string, obj: any): [string, any[]] => {
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