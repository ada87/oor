// import { test as jtest, Test, TestContext } from '@japa/runner';
// import { TestExecutor } from '@japa/core';
// import { setup, } from '../sqljs/node';
// import _ from 'lodash';
// // import { UserSchema } from './Const';
// // export { SUFFIX_MATRIX } from '../pg/basic/where';
// import init, { Database } from 'sql.js'

// import { homedir } from 'os'
// import { join,resolve } from 'path';

// // export const MODE = 'sqlite';
// // const sql = 
// // const db = new sql.Database();
// // describe



// // let pid: any = null;

// let db: Database;

// export const test = (title: string, callback: TestExecutor<TestContext, undefined>): Test<undefined> => jtest(title, callback)
//     .setup(async () => {
//         const sql = await init({ locateFile: () => join(homedir(), process.env.sqlite_db || 'tool_test.db') });
//         db = new sql.Database();
//         setup({
//             provider: {
//                 wasm: resolve('./node_modules/sql.js/s.sam'),
//                 db: '',
//             },
//             strict: true,
//             showSQL: console.log
//         })

//     }).teardown(() => {
//         db.close();
//     });



// // // Line 4 : Build a Table, it's ok for all
// // export const User = new Table('public.user', UserSchema, {
// //     // globalCondition: [{ column: 'id', fn: '!=', 'value': 1 }]
// // });

// // // @ts-ignore
// // export const FIELD_MAP = User._CONFIG.FIELD_MAP as Map<string, USchema>;

