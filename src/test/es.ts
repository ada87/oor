export { test } from '@japa/runner';
import { readFileSync } from 'fs';
import '@japa/assert';
import { setup, UType, Static, View, Table } from '../es';
import { Client } from '@elastic/elasticsearch'

export const client = new Client({
    node: process.env.ES_NODE,
    tls: {
        ca: readFileSync('D:\\ELK\\kibana-8.5.0\\data\\ca_1667380877979.crt'),
        rejectUnauthorized: false,
    },
    auth: {
        username: process.env.ES_USER || 'elastic',
        password: process.env.ES_PASS || 'changeme',
    }
})

setup({ provider: () => client, strict: false, showSQL: console.error })



export const UserSchema = UType.Table({
    id: UType.Number(),
    name: UType.String({ maxLength: 32 }),
    age: UType.Number({ minimum: 0, maximum: 128 }),
    sex: UType.Boolean(),
    profile: UType.String({ ignore: true }),
    address: UType.String({ maxLength: 128, ignore: true }),
    salary: UType.Number(),
    registerDate: UType.Date({ column: 'register_date', isCreate: true, ignore: true }),
    lastModify: UType.Date({ column: 'last_modify', isModify: true, ignore: true })
});

// Line 3 : Define a Type, you can avoid if not need this type.
// export type User = Static<typeof UserSchema>;

// Line 4 : Build a Table, it's ok for all
export const User = new Table('user', UserSchema, {
    key: 'register_date',
    globalCondition: [{ fn: '>', column: 'age', value: 2 }]
});

// @ts-ignore
// export const FIELD_MAP = User._CONFIG.FIELD_MAP as Map<string, USchema>;

