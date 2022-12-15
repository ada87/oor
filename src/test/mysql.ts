import { test as jtest, Test, TestContext } from '@japa/runner';
import { createPool, Pool } from 'mysql2/promise';
import { TestExecutor } from '@japa/core';
import { setup, Table, UType, Static } from '../mysql/index';
import * as _ from 'lodash';


export var mysql: Pool = createPool({
    host: process.env.MY_HOST as string,
    port: parseInt(process.env.MY_PORT as string),
    user: process.env.MY_USER as string,
    database: process.env.MY_DB as string,
    password: process.env.MY_PASS || undefined,
});


setup({
    provider: () => mysql,
    strict: true,
    showSQL: console.log
})



let pid: any = null;


export const test = (title: string, callback: TestExecutor<TestContext, undefined>): Test<undefined> => jtest(title, callback)
    // .setup(async () => {  })
    .teardown(() => {
        pid = setTimeout(() => mysql.end(), 20);
        // pg.end();
    });


// Line 2 : Build a Schema , 
//          Schema can be used for validate、check, @see @sinclair/typebox
//          Some FrameWork support this schema derectly , like fastify 
export const UserSchema = UType.Table({
    id: UType.Number(),
    name: UType.String({ maxLength: 32 }),
    age: UType.Number({ minimum: 0, maximum: 128 }),
    sex: UType.Boolean(),
    profile: UType.String({ ignore: true }),
    address: UType.String({ maxLength: 128 }),
    salary: UType.Number(),
    registerDate: UType.Date({ column: 'register_date', isCreate: true }),
    lastModify: UType.Date({ column: 'last_modify', isModify: true })
},);

// Line 3 : Define a Type, you can avoid if not need this type.
export type User = Static<typeof UserSchema>;

// Line 4 : Build a Table, it's ok for all
export const User = new Table('user', UserSchema, {
    // globalCondition: [{ column: 'id', fn: '!=', 'value': 1 }]
});

// @ts-ignore
export const FIELD_MAP = User._CONFIG.FIELD_MAP as Map<string, USchema>;

