import _ from 'lodash';
import { SqlUpdate } from '../../base/sql';

export const update: SqlUpdate = (table: string, obj: any, key = 'id'): [string, any[]] => {
    const fields = _.keys(obj);
    if (fields.length == 0) throw new Error();
    let query = [];
    let param = [];

    let diff = 1;
    fields.map((field, i) => {
        // Not Allow Update Primary Key
        if (field == key) {
            diff = 0;
            return;
        }
        let val = obj[field];
        query.push(`${field} = $${i + diff}`)
        param.push(val)
    });


    // param.push(id);
    return [`UPDATE  ${table} SET ${query.join(',')}`, param];
}



