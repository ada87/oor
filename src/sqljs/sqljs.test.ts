import '@japa/assert';
import { test } from '@japa/runner';
// import { test, User, MODE,SUFFIX_MATRIX } from './test/es';
// import { QueryCover } from './test/Const';
import initSqlJs from 'sql.js/dist/sql-wasm';
// const initSqlJs = require('sql-wasm.js');
import { readFileSync } from 'fs'

test(` Test : Conn With SQLjs`, async () => {
    // const result = await User.sql(`SELECT * FROM  public.user WHERE name='陆磊'`);
    // console.log(result);
    const SQL = await initSqlJs({ wasmBinary: readFileSync('D:\\sql-wasm.wasm') });
    console.log(SQL)
    const d = new SQL.Database()


})
    .pin()
    // .skip();
    ;