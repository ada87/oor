import { test as jtest, Test, TestContext } from '@japa/runner';
import { Client } from 'pg';
import { TestExecutor } from '@japa/core';
import { setup, BaseTable, UType, Static } from '../index';
import * as _ from 'lodash';


export var pg: Client = new Client({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || '5432'),
    user: process.env.PG_USER,
    database: process.env.PG_DB,
});

export const test = (title: string, callback: TestExecutor<TestContext, undefined>): Test<undefined> => jtest(title, callback)
    .setup(async () => {
        await pg.connect()
        setup({ provider: () => pg })
    }).teardown(() => {
        pg.end();
    });



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
});                                                        // Line 1
export type User = Static<typeof UserSchema>;              // Line 2
export const User = new BaseTable('user', UserSchema);     // Line 3