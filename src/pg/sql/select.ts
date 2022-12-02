import { SqlSelect } from '../../base/sql';

export default (table: string, id: string | number, fields?: string[], key: string = 'id'): [string, any[]] => {
    let _fields = '*';
    if (fields && fields.length) {
        _fields = fields.join(',');
    }
    return [`SELECT ${_fields} FROM ${table} WHERE ${key} = $1 `, [id]];
}


