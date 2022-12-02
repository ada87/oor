import _ from 'lodash';
import { PG } from '.'
import type { ClientBase } from 'pg';
import { SqlExecuter } from '../../base/sql';
export const executor: SqlExecuter = {

    insert: (conn, sql: string, param: any): Promise<any> => {
        return null;
    },
    select: (conn, sql: string, param: any): Promise<any[]> => {
        return null;
    },
    exec: (conn, sql: string, param: any): Promise<number> => {
        return null;
    },
}

export const insert = async (pg: ClientBase, table: string, obj: any): Promise<any> => {
    const [SQL, PARAM] = PG.insert(table, obj);
    const result = await pg.query(SQL, PARAM);
    if (result.rowCount == 1) {
        return result.rows[0];

    }
    throw new Error();
}


export const deleteById = async (pg: ClientBase, table: string, id: string | number, key: string = 'id'): Promise<number> => {
    const [SQL, PARAM] = PG.deleteById(table, id, key);
    const result = await pg.query(SQL, PARAM);
    return result.rowCount;
}


export const update = async (pg: ClientBase, table: string, obj: any, key: string = 'id'): Promise<number> => {
    const [SQL, PARAM] = PG.updateById(table, obj, key);
    const result = await pg.query(SQL, PARAM);
    return result.rowCount;
}


export const selectById = async (pg: ClientBase, table: string, id: string | number, fields?: string[], key: string = 'id'): Promise<any> => {
    const [SQL, PARAM] = PG.selectById(table, id, fields, key);
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