import { test } from 'tsest'
import { BaseDB } from './BaseDB'

import type { TableOptions, DatabaseOptions } from './types';
// import type { QueryParam } from '../utils/types';
// 性能：引号的使用不会直接影响查询性能。
// 正确性：引号确保标识符被正确解析，特别是在标识符包含特殊字符或区分大小写时。
// 建议：仅在必要时使用引号，如标识符包含特殊字符或与保留字冲突时。

import { UType } from '../utils/types';
import { PgView } from '../lib-pg/PgView';

import { bgGreen, bgRed, colorFieldName, colorGreen, colorMagenta, colorRed, colorWhite, colorYellow } from '../utils/color';

class TestDB extends BaseDB<any, any> {
    public getConn(): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
export const DB = new TestDB({}, { pageSize: 12 });;
export const TABLE_NAME = 'user';
export const TABLE_OPTIONS: TableOptions = {

    // strictQuery: true,
    // strictEntity: true,
    // globalCondition: { age: 1 }
}

export const DATABASE_OPTIONS: DatabaseOptions = {}


export const OK = bgGreen(colorWhite(' O K '));
export const ERROR = bgRed(colorWhite('Error'));
export const UserSchema = UType.Table({
    id: UType.Integer({ title: 'ID', column: 'id' }),
    name: UType.StringRequired({ maxLength: 32, title: '姓名', }),
    age: UType.Integer({ minimum: 0, maximum: 128, delMark: 64, title: '年龄', }),
    sex: UType.Boolean({ title: '性别', default: false, }),
    profile: UType.String({ ignore: true, title: '简介' }),
    address: UType.String({ maxLength: 128, title: '地址' }),
    salary: UType.Double({ ignore: true, title: '薪水', default: 3000 }),
    registerDate: UType.Date({ column: 'register_date', isCreate: true, title: '注册日期', readOnly: true }),
    lastModify: UType.Date({ column: 'last_modify', isModify: true, title: '最后修改' }),
});


// console.log(UserSchema)

export const PG_VIEW = new PgView(DB, TABLE_NAME, UserSchema, TABLE_OPTIONS);


test('Condition', {
    skip: true,
    // only: true,
}, () => {
    const { BUILDER } = PG_VIEW;
    const where = BUILDER.convertQuery({
        idMin: 100, idMax: 199, sex: 1, age: new Date(),
        _order: 'id', _by: 'asc', _start: 100, _count: 100
    });
    console.log(BUILDER.where(where))
})


test('Test : Schema', {
    // only: true,
    skip: true,
}, async () => {
    const { BUILDER } = PG_VIEW;
    const user = await PG_VIEW.getById(1);
    // user.

    // user.registerDate
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
    console.log(BUILDER.limit({ _start: 100, _count: 100 }))
    console.log(BUILDER.limit({ _start: 100, }))   //PAGESIZE
    console.log(BUILDER.limit({}))                  //PAGESIZE

    console.log(BUILDER.orderBy())
    console.log(BUILDER.orderBy(false))
    console.log(BUILDER.orderBy(true))
    console.log(BUILDER.orderBy({ _order: 'id', _by: 'asc' }))

    console.log(BUILDER.orderByLimit())
    console.log(BUILDER.orderByLimit(false))
    console.log(BUILDER.orderByLimit(true))
    console.log(BUILDER.orderByLimit({ _order: 'id', _by: 'asc', _start: 100, _count: 100 }))

    // console.log(BUILDER.where({ id: 100 }))


    //         where: (where: WhereParam, startIdx?: number) => SQLStatement;
    //         fixWhere: {
    //             (statement?: SQLStatement): SQLStatement;
    //         }
})