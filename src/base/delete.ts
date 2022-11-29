import _ from 'lodash';
import type { ClientBase } from 'pg';

const _deleteById = (table: string, id: string | number, key): [string, any[]] => {
    return [`DELETE FROM ${table} WHERE ${key} = $1 `, [id]];
}


export const deleteById = async (pg: ClientBase, table: string, id: string | number, key: string = 'id'): Promise<number> => {
    const [SQL, PARAM] = _deleteById(table, id, key);
    const result = await pg.query(SQL, PARAM);
    return result.rowCount;
}