import { test } from 'node:test';
test('name', {
    timeout: 1000,
    only: true,
    skip: true,
    todo: true,
    plan: 12,
}, (ctx, done) => {


    
    ctx.before()
    done();
})

// export { test } from '@japa/runner';
// import { readFileSync } from 'fs';
// import '@japa/assert';
// import { setup, UType, Static, View, Table, FlatView } from '../es';
// import { Client } from '@elastic/elasticsearch'
// import { UserSchema, } from './Const';
// export { SUFFIX_MATRIX } from '../es/basic/dsl';

// export const MODE = 'ES';

// export const client = new Client({
//     node: process.env.ES_NODE,
//     tls: {
//         ca: readFileSync(process.env.ES_CA as string),
//         rejectUnauthorized: false,
//     },
//     auth: {
//         username: process.env.ES_USER as string,
//         password: process.env.ES_PASS as string,
//     }
// })

// setup({ provider: () => client, strict: false, showSQL: console.error })




// // Line 4 : Build a Table, it's ok for all
// export const User = new FlatView('user', UserSchema, {
//     key: 'register_date',
//     // globalCondition: [{ fn: '>', column: 'age', value: 2 }]
// });

// // @ts-ignore
// // export const COLUMN_MAP = User._CONFIG.COLUMN_MAP as Map<string, OColumn>;

