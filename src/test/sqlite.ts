// import { test as jtest, Test, TestContext } from '@japa/runner';
// import { TestExecutor } from '@japa/core';
// import { setup, } from '../sqlite';
// import _ from 'lodash';
// // import { UserSchema } from './Const';
// // export { SUFFIX_MATRIX } from '../pg/basic/where';
// import { verbose } from 'sqlite3'

// import { homedir } from 'os'
// import { join } from 'path';

// // export const MODE = 'sqlite';
// const sql = verbose();
// const db = new sql.Database(join(homedir(), process.env.sqlite_db || 'tool_test.db'));
// setup({
//     provider: () => db,
//     strict: true,
//     showSQL: console.log
// })



// // let pid: any = null;


// export const test = (title: string, callback: TestExecutor<TestContext, undefined>): Test<undefined> => jtest(title, callback)
//     .setup(async () => {
//         await db.serialize();
//     }).teardown(() => {
//         db.close();
//     });



// // // Line 4 : Build a Table, it's ok for all
// // export const User = new Table('public.user', UserSchema, {
// //     // globalCondition: [{ column: 'id', fn: '!=', 'value': 1 }]
// // });

// // // @ts-ignore
// // export const COLUMN_MAP = User._CONFIG.COLUMN_MAP as Map<string, OColumn>;

