import test from 'node:test';
import { TABLE_NAME, TABLE_OPTIONS, UserSchema } from '../core/Schema.test';
import { PG, QuerySchema } from '../pg';


const USER = PG.View(TABLE_NAME, UserSchema, TABLE_OPTIONS);

// export const DB = new TestDB({}, { pageSize: 12 });;
// export const TABLE_NAME = 'user';
// export const TABLE_OPTIONS: TableOptions = {}
// export const DATABASE_OPTIONS: DatabaseOptions = {}

// export const UserSchema = UType.Table({
//     id: UType.Integer(),
//     name: UType.String({ maxLength: 32 }),
//     age: UType.Integer({ minimum: 0, maximum: 128 }),
//     sex: UType.Boolean(),
//     profile: UType.String({ ignore: true }),
//     address: UType.String({ maxLength: 128 }),
//     salary: UType.Number(),
//     registerDate: UType.Date({ column: 'register_date', isCreate: true }),
//     lastModify: UType.Date({ column: 'last_modify', isModify: true })
// });

test('queryPagination', {
    // only: true
    skip: true
}, async () => {


    const QUERY_PAGINATION = await USER.queryPagination({
        _count: 2,
        nameLike: '丽',
        idMin: 100,
        salaryMinThan: 1000,
        salaryMax: 2000,

    })
    console.log(QUERY_PAGINATION)

    // const result = await USER.query({ idMin: 11, idMax: 20 })
    // console.log(result)
})


test('GET', {
    only: true
}, async () => {


    // const GET_BY_ID = await USER.getById(49)
    // console.log(GET_BY_ID)



    // const GET_BY_FIELD = await USER.getByField('name', '张丽')
    // console.log(GET_BY_FIELD)
    const query: QuerySchema = {
        _count: 2,
        // nameLike: '丽',
        idMin: 100,
        salaryMinThan: 1000,
        salaryMax: 2000,
        sex: true,
        _order: 'id',
        _by: 'desc',

    }
    // const statement = USER.BUILDER.where(USER.BUILDER.convertQuery(query));

    // const ok = USER.BUILDER.fixWhere(statement);
    // console.log(ok)


    // console.log(USER.BUILDER.select());
    // const where = USER.BUILDER.convertQuery(query);
    // console.log(where)

    const GET_BY_QUERY = await USER.getByQuery(query)

    // const result = await USER.query({ idMin: 11, idMax: 20 })
    // console.log(result)
})