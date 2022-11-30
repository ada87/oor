import _ from 'lodash';
import type { ClientBase } from 'pg';

const _selectById = (table: string, id: string | number, fields?: string[], key: string = 'id'): [string, any[]] => {
    let _fields = '*';
    if (fields && fields.length) {
        _fields = fields.join(',');
    }
    return [`SELECT ${_fields} FROM ${table} WHERE ${key} = $1 `, [id]];
}

export const selectById = async (pg: ClientBase, table: string, id: string | number, fields?: string[], key: string = 'id'): Promise<any> => {
    const [SQL, PARAM] = _selectById(table, id, fields, key);
    const result = await pg.query(SQL, PARAM);
    if (result.rowCount == 1) {
        return result.rows[0]
    }
    return null;
}


export const selectAll = async (pg: ClientBase, table: string, fields: string = '*'): Promise<any[]> => {
    const result = await pg.query(`SELECT ${fields} FROM ${table}`);
    return result.rows;
}