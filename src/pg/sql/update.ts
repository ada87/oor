import _ from 'lodash';
import { SqlUpdate } from '../../base/sql';

export default (table: string, obj: any, key: string = 'id'): [string, any[]] => {
    const fields = _.keys(obj);
    if (fields.length == 0) {
        throw new Error();
    }
    let id = null;
    let query = [];
    let param = [];

    fields.map((field, i) => {
        if (field == key) {
            id = obj[field]
            return;
        }
        let val = obj[field];
        query.push(field + ' = $' + (i + (id ? 0 : 1)))
        param.push(val)
    })
    if (id === null || query.length == 0) {
        throw new Error();

    }
    param.push(id);
    return [`UPDATE  ${table} SET ${query.join(',')} WHERE ${key} = $${query.length + 1}`, param];
}



