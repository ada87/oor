import { test as jtest, Test, TestContext } from '@japa/runner';
import { Client } from 'pg';
import { TestExecutor } from '@japa/core';
import { setup, Table, } from '../pg/index';
import _ from 'lodash';
import { UserSchema } from './Const';
export { SUFFIX_MATRIX } from '../pg/basic/where';


import type { ClientConfig } from 'pg';


const config: ClientConfig = {
    host: process.env.PG_HOST as string,
    port: parseInt(process.env.PG_PORT as string),
    user: process.env.PG_USER as string,
    database: process.env.PG_DB as string,
    password: process.env.PG_PASS || undefined,
};

export const MODE = 'PG';

export var pg: Client = new Client(config);

setup({
    provider: () => pg,
    strict: true,
    showSQL: console.log
})



let pid: any = null;


export const test = (title: string, callback: TestExecutor<TestContext, undefined>): Test<undefined> => jtest(title, callback)
    .setup(async () => {

        clearTimeout(pid);
        // @ts-ignore
        if (!pg._connected) {
            await pg.connect()
        }

    }).teardown(() => {
        pid = setTimeout(() => pg.end(), 200);
        // pg.end();
    });



// Line 4 : Build a Table, it's ok for all
export const User = new Table('public.user', UserSchema, {
    // globalCondition: [{ column: 'id', fn: '!=', 'value': 1 }]
});


// @ts-ignore
export const FIELD_MAP = User._CONFIG.FIELD_MAP as Map<string, USchema>;

