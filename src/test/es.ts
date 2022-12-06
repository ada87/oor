// import { test as jtest, Test, TestContext } from '@japa/runner';
// import { assert } from '@japa/assert'
// import { Client } from '@elastic/elasticsearch';
// import { TestExecutor } from '@japa/core';
// import { setup, Table, UType, Static } from '../index';
// import * as _ from 'lodash';


// export var pg: Client = new Client({
//     host: process.env.PG_HOST || 'pgserver',
//     port: parseInt(process.env.PG_PORT || '5432'),
//     user: process.env.PG_USER || 'postgres',
//     database: process.env.PG_DB || 'oor',
// });
// setup({
//     provider: () => pg,
//     strict: true,
//     showSQL: console.log
// })



// let pid: any = null;


// export const test = (title: string, callback: TestExecutor<TestContext, undefined>): Test<undefined> => jtest(title, callback)
//     .setup(async () => {

//         clearTimeout(pid);
//         // console.log(pg)
//         // @ts-ignore
//         if (!pg._connected) {
//             await pg.connect()
//         }

//     }).teardown(() => {
//         pid = setTimeout(() => pg.end(), 200);
//         // pg.end();
//     });


// // Line 2 : Build a Schema , 
// //          Schema can be used for validate、check, @see @sinclair/typebox
// //          Some FrameWork support this schema derectly , like fastify 
// export const UserSchema = UType.Table({
//     id: UType.Number(),
//     name: UType.String({ maxLength: 32 }),
//     age: UType.Number({ minimum: 0, maximum: 128 }),
//     sex: UType.Boolean(),
//     profile: UType.String({ ignore: true }),
//     address: UType.String({ maxLength: 128 }),
//     salary: UType.Number(),
//     registerDate: UType.Date({ column: 'register_date', isCreate: true }),
//     lastModify: UType.Date({ column: 'last_modify', isModify: true })
// },);

// // Line 3 : Define a Type, you can avoid if not need this type.
// export type User = Static<typeof UserSchema>;

// // Line 4 : Build a Table, it's ok for all
// export const User = new Table('public.user', UserSchema, {
//     globalCondition: [{ field: 'id', condition: '!=', 'value': 1 }]
// });

// // @ts-ignore
// export const FIELD_MAP = User._CONFIG.FIELD_MAP as Map<string, USchema>;

