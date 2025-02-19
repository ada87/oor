import { test } from 'tsest'
import { BaseDB } from './BaseDB'

import type { TableOptions, DatabaseOptions } from './types';


import { UType } from '../utils/types';
import { PgView } from '../lib-pg/PgView';


class TestDB extends BaseDB<any, any> {
    public getConn(): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
export const DB = new TestDB({}, { pageSize: 12 });;
export const TABLE_NAME = 'user';
export const TABLE_OPTIONS: TableOptions = {}
export const DATABASE_OPTIONS: DatabaseOptions = {}

export const UserSchema = UType.Table({
    id: UType.Integer(),
    name: UType.String({ maxLength: 32 }),
    age: UType.Integer({ minimum: 0, maximum: 128 }),
    sex: UType.Boolean(),
    profile: UType.String({ ignore: true }),
    address: UType.String({ maxLength: 128 }),
    salary: UType.Number(),
    registerDate: UType.Date({ column: 'register_date', isCreate: true }),
    lastModify: UType.Date({ column: 'last_modify', isModify: true })
});


export const VIEW = new PgView(DB, TABLE_NAME, UserSchema, TABLE_OPTIONS);



test('Test : Schema', {
    only: true,
}, () => { 
    // console.log(UserSchema)

    console.log(VIEW)


})