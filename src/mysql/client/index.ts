import type { Connection } from 'mysql2/promise';


export const insert = async (conn: Connection, table: string, obj: any): Promise<any> => {
    // const [SQL, PARAM] = PG.insert(table, obj);
    // const result = await pg.query(SQL, PARAM);
    // if (result.rowCount == 1) {
    //     return result.rows[0];

    // }
    throw new Error();
}
