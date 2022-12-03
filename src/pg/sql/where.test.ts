import { test } from '@japa/runner'
// import { FIELD_MAP } from '../test/pg';
import type { WhereCondition, QuerySchema } from '../../base/types'
import { where, getRange, getNumberRange, getDateRange } from './where'
// import { whereByQuery } from './QueryBuilder';
// import { orderByLimit } from './QueryPagition';


test('Test : Range Number', ({ assert }, txt) => {
    console.log(txt, getNumberRange(txt as any))
}).with([
    '',
    '0,20',
    '0,',
    ',20',
    '(0,20',
    '[0,20',
    '0,20)',
    '0,20]',
    '[0,20]',
    '(0,20)',
    '0,20,df,fads',
])
    // .pin()
    ;

test('Test : Range Date', ({ assert }, txt) => {
    console.log(txt, getDateRange(txt as any))
}).with([
    '',
    '2000-01-01,20110101',
])
    // .pin()
    ;



test('Test : WhereToSql', ({ assert }) => {
    assert.throws(() => where({
        // string not support MaxD will throw a error
        link: 'AND', items: [{ field: 'name', type: 'string', value: 'a', condition: 'MaxD' }]
    }), 'Some SQL Error Occur');


    const [SQL, PARAM] = where({
        // string not support MaxD will throw a error
        link: 'AND', items: [
            { field: 'name', type: 'string', value: 'a', condition: 'Like' },
            { field: 'profile', value: '', condition: 'IsNull' },
            {
                link: 'OR', items: [
                    { field: 'age', type: 'number', value: 14, condition: '<=' },
                    { field: 'age', type: 'number', value: 60, condition: '>=' },
                ]
            }
        ]
    });
    console.log(SQL, PARAM)


})
    // .pin()

    ;



test('Test : buildSQL', ({ assert }) => {

    const root: WhereCondition = {
        link: 'AND',
        items: [
            { field: 'a1', condition: '<', value: 'value1' },
            { field: 'a2', condition: '<', value: 'value2' },

            {
                link: 'OR', items: [
                    { field: 'b1', condition: 'Like', value: 'value3' },
                    { field: 'b2', condition: '>=', value: 'value4' },
                ]
            },
            { field: 'a3', condition: '<', value: 'value1' },

        ]
    }

    // const sql = whereByCondition(root);
    // assert.equal(sql[1].length, 5)

    // console.log(sql[0], sql[1])
});
