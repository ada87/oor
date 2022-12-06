import { test } from '@japa/runner'
import { FIELD_MAP } from '../test/pg';
import { WhereParam, QuerySchema, SUFFIX } from '../base/types'
import { where, between, betweenNumber, betweenDate } from './where'
import { queryToCondition } from '../base/QueryBuilder';
// import { whereByQuery } from './QueryBuilder';
// import { orderByLimit } from './QueryPagition';


test('Test : Between Number', ({ assert }, txt) => {
    // console.log(txt, getNumberRange(txt as any))

    // let query: any = {};
    // for (let suffix of SUFFIX) {
    //     query['age' + suffix] = 12;
    //     // query['name' + suffix] = 'abc';
    // }
    const query: any = { ageBt: txt }
    // console.log(query)
    let condition = queryToCondition(query, FIELD_MAP, new Map());
    // console.log(condition)
    // console.log(condition.items.length);
    const [sql, param] = where(condition);
    console.log(query.ageBt, sql, param)


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

test('Test : Between Date', ({ assert }, txt) => {
    console.log(txt, betweenDate(txt as any))
}).with([
    '',
    '2022-11-11,2022-11-12',
    '2022-11-11 11:11:11,2022-11-12 12:12',
    '[2022-11-11,2022-11-12]',
    '(2022-11-11,2022-11-12)',
    '0,20,df,fads',
])
    // .pin()
    ;



test('Test : WhereToSql', ({ assert }) => {
    assert.throws(() => where({
        // string not support MaxD will throw a error
        link: 'AND', items: [{ column: 'name', type: 'string', value: 'a', condition: 'MaxD' }]
    }), 'Some SQL Error Occur');


    const [SQL, PARAM] = where({
        // string not support MaxD will throw a error
        link: 'AND', items: [
            { column: 'name', type: 'string', value: 'a', condition: 'Like' },
            { column: 'profile', value: '', condition: 'IsNull' },
            {
                link: 'OR', items: [
                    { column: 'age', type: 'number', value: 14, condition: '<=' },
                    { column: 'age', type: 'number', value: 60, condition: '>=' },
                ]
            }
        ]
    });
    console.log(SQL, PARAM)


})
    // .pin()

    ;



test('Test : buildSQL', ({ assert }) => {

    const root: WhereParam = {
        link: 'AND',
        items: [
            { column: 'a1', condition: '<', value: 'value1' },
            { column: 'a2', condition: '<', value: 'value2' },

            {
                link: 'OR', items: [
                    { column: 'b1', condition: 'Like', value: 'value3' },
                    {
                        link: 'NOT', items: [
                            { column: 'd1', value: 'test1' },
                            { column: 'd2', value: 'test2' },
                            {
                                link: 'AND', items: [
                                    { column: 'e1', value: 'test6' },
                                    { column: 'e2', value: 'test7' },

                                ]
                            }
                        ]
                    },
                    { column: 'b2', condition: '>=', value: 'value4' },

                ]
            },
            { column: 'a3', condition: '<', value: 'value1' },

        ]
    }

    const sql = where(root);
    console.log(sql)
    // assert.equal(sql[1].length, 5)

    // console.log(sql[0], sql[1])
})
    .pin()

    ;



test('Test : Where', ({ assert }, txt) => {
    const condition: WhereParam = {
        link: 'AND', items: [
            {
                type: 'date',
                field: 'sex',
                // @ts-ignore
                "condition": txt,
                value: '2022-11-11 11:11:11'
            }
        ]
    }
    console.log(txt, where(condition, 1))
    // console.log(txt, getDateRange(txt as any))
})
    .with(SUFFIX as any)
    // .pin()
    ;


