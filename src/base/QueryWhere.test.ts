import { test } from '@japa/runner'
import { FIELD_MAP } from '../test/pg';
import type { WhereCondition, QuerySchema } from './types'
import { whereByCondition, getRange, getNumberRange, getDateRange } from './QueryWhere'
import { whereByQuery } from './QueryBuilder';
import { orderByLimit } from './QueryPagition';


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
    .pin()
    ;



test('Test : WhereToSql', ({ assert }) => {
    assert.throws(() => whereByCondition({
        // string not support MaxD will throw a error
        link: 'AND', items: [{ field: 'name', type: 'string', value: 'a', condition: 'MaxD' }]
    }), 'Some SQL Error Occur');


    const [SQL, PARAM] = whereByCondition({
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


