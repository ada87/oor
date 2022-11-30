import { pg, test } from '../test/pg'
import type { TSchema } from '@sinclair/typebox';
import type { WhereCondition } from './types'
import { UType, setup } from './Util';
import { whereByCondition } from './QueryWhere'
import _ from 'lodash';
// import { whereByQuery } from './QueryBuilder';
import { BaseTable } from './BaseTable'


setup({ provider: () => pg })


test('Test : buildSQL', () => {

    const root: WhereCondition = {
        link: 'AND',
        items: [
            { field: 'a1', operation: '<', value: 'value1' },
            // { field: 'a2', operation: '<', value: 'value2' },

            {
                link: 'OR', items: [
                    { field: 'b1', operation: 'LIKE', value: 'value3' },
                    { field: 'b2', operation: '>=', value: 'value4' },
                ]
            },
            { field: 'a3', operation: '<', value: 'value1' },

        ]
    }

    const sql = whereByCondition(root);
    console.log(sql[0], sql[1])
});


// import { Type, Kind } from '@sinclair/typebox';
const User = UType.Table({
    id: UType.Number(),
    name: UType.String({ maxLength: 64 }),
    age: UType.Integer({ minimum: 0, maximum: 125 }),
    sex: UType.Boolean(),
    create_date: UType.Date({ isCreate: true }),
    last_modify: UType.Date({ isModify: true }),

    // a: Type.Any(),
    // b:Type.Array(Type.String()),
    // c:Type.Never(),
    // d:Type.Null(),
    // e:Type.Object(),
    // f:Type.Promise(),
    // g:Type.RegEx()
    // h:Type.Unsafe()

})
const FIELD_MAP = new Map<string, TSchema>();
_.keys(User.properties).map(field => {
    FIELD_MAP.set(field, User.properties[field])
    // console.log(User.properties[field][Kind])
});

test('Test : buildQuery', () => {
    let query = {
        id: 1,
        ageMin: 2,
        sex: true,
        ageMax: 12,
        create_dateMin: new Date(),

    };
    // let p = whereByQuery(query, FIELD_MAP, new Map());

    // console.log(p);



    // buildQuery({ a: '1' })
});



test('Test : insert', async () => {

    let userModel = new BaseTable('ta', User)
    userModel.insert({
        name: 'a'
    })


    // id: UType.Number(),
    // name: UType.String({ maxLength: 64 }),
    // age: UType.Integer({ minimum: 0, maximum: 125 }),
    // sex: UType.Boolean(),
    // create_date: UType.Date({ isCreate: true }),
    // last_modify: UType.Date({ isModify: true }),

})
    // .pin()
    ;