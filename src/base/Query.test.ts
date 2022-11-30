import { test } from '@japa/runner'
import { User, UserSchema } from '../test/pg';
import type { WhereCondition } from './types'
import { whereByCondition } from './QueryWhere'
function sum(a, b) {
    return a + b
}
test('add two numbers', ({ assert }) => {
    assert.equal(sum(2, 2), 4)
})

test('Test : buildSQL', ({ assert }) => {

    const root: WhereCondition = {
        link: 'AND',
        items: [
            { field: 'a1', operation: '<', value: 'value1' },
            { field: 'a2', operation: '<', value: 'value2' },

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
    assert.equal(sql[1].length, 5)

    // console.log(sql[0], sql[1])
});



test('Test : buildQuery', ({ assert }) => {
    let query = {
        id: 1,
        ageMin: 2,
        sex: true,
        ageMax: 12,
        create_dateMin: new Date(),

    };
    // console.log(query)
    // let p = whereByQuery(query, FIELD_MAP, new Map());

    // console.log(p);



    // buildQuery({ a: '1' })
});


