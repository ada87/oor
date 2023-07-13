import '@japa/assert';
import { test } from '@japa/runner';
import initSqlJs from 'sql.js/dist/sql-wasm';
import { readFileSync } from 'fs'

test(` Test : Conn With SQLjs`, async () => {
    // const result = await User.sql(`SELECT * FROM  public.user WHERE name='陆磊'`);
    // console.log(result);
    const SQL = await initSqlJs({ wasmBinary: readFileSync('D:\\sql-wasm.wasm') });
    const d = new SQL.Database()


})
    .pin()
    // .skip();
    ;