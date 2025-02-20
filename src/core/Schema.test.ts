import { test } from 'tsest'
import { BaseDB } from './BaseDB'

import type { TableOptions, DatabaseOptions } from './types';

// 性能：引号的使用不会直接影响查询性能。
// 正确性：引号确保标识符被正确解析，特别是在标识符包含特殊字符或区分大小写时。
// 建议：仅在必要时使用引号，如标识符包含特殊字符或与保留字冲突时。

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


export const PG_VIEW = new PgView(DB, TABLE_NAME, UserSchema, TABLE_OPTIONS);


test('Condition', {
    only: true,
}, () => {
    const { BUILDER } = PG_VIEW;
    const where = BUILDER.convertQuery({
        idMin: 100, idMax: 199, sex: 1, age: new Date(),
        _order_: 'id', _by_: 'asc', _start_: 100, _count_: 100
    });
    console.log(BUILDER.where(where))
})


test('Test : Schema', {
    // only: true,
    skip: true,
}, () => {
    const { BUILDER } = PG_VIEW;

    console.log(BUILDER.select())
    console.log(BUILDER.select(['name', 'age']))
    console.log(BUILDER.select('name, age, id, name as XXXOO'))
    console.log(BUILDER.select(true));

    console.log(BUILDER.byId(100))
    console.log(BUILDER.byId('100'))

    console.log(BUILDER.byField('name', '100'));
    console.log(BUILDER.byField('name', 100));
    console.log(BUILDER.byField('name', true));

    console.log(BUILDER.count())
    console.log(BUILDER.count(true))
    console.log(BUILDER.count(false))
    console.log(BUILDER.count('name', true))
    console.log(BUILDER.count('name', false))


    console.log(BUILDER.limit())                    // PAGE_SIZE
    console.log(BUILDER.limit(10))
    console.log(BUILDER.limit(10, 100))
    console.log(BUILDER.limit({ _start_: 100, _count_: 100 }))
    console.log(BUILDER.limit({ _start_: 100, }))   //PAGESIZE
    console.log(BUILDER.limit({}))                  //PAGESIZE

    console.log(BUILDER.orderBy())
    console.log(BUILDER.orderBy(false))
    console.log(BUILDER.orderBy(true))
    console.log(BUILDER.orderBy({ _order_: 'id', _by_: 'asc' }))

    console.log(BUILDER.orderByLimit())
    console.log(BUILDER.orderByLimit(false))
    console.log(BUILDER.orderByLimit(true))
    console.log(BUILDER.orderByLimit({ _order_: 'id', _by_: 'asc', _start_: 100, _count_: 100 }))

    // console.log(BUILDER.where({ id: 100 }))


    //         where: (condition: WhereParam, startIdx?: number) => SQLStatement;
    //         fixWhere: {
    //             (statement?: SQLStatement): SQLStatement;
    //         }
})