// import type { SqlDelete } from '../../base/sql';

export default (table: string, id: string | number, key): [string, any[]] => {
    return [`DELETE FROM ${table} WHERE ${key} = $1 `, [id]];
};


