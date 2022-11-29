import { test as jtest, Test, TestContext } from '@japa/runner';
import { Client } from 'pg';
import { TestExecutor } from '@japa/core';
import * as _ from 'lodash';


export var pg: Client = new Client({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    user: process.env.PG_USER,
    database: process.env.PG_DB,
});

export const test = (title: string, callback: TestExecutor<TestContext, undefined>): Test<undefined> => jtest(title, callback)
    .setup(async () => {
        await pg.connect()
    }).teardown(() => {
        pg.end();
    });