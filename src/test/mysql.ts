import { test as jtest, Test, TestContext } from '@japa/runner';
import { createPool, Pool } from 'mysql2/promise';
import { TestExecutor } from '@japa/core';
import { setup, Table, } from '../mysql/index';
import _ from 'lodash';
import { UserSchema, } from './Const';

export { SUFFIX_MATRIX } from '../mysql/basic/where';


export const MODE = 'MYSQL';

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



// Line 4 : Build a Table, it's ok for all
export const User = new Table('user', UserSchema, {
    // globalCondition: [{ column: 'id', fn: '!=', 'value': 1 }]
});

// @ts-ignore
export const FIELD_MAP = User._CONFIG.FIELD_MAP as Map<string, USchema>;

