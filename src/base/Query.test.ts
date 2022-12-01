import { test } from '@japa/runner'
import { User, UserSchema } from '../test/pg';
import type { WhereCondition, QuerySchema } from './types'
import { whereByCondition, } from './QueryWhere'
import { whereByQuery } from './QueryBuilder';
import { orderByLimit } from './QueryPagition';

//@ts-ignore
const FIELD_MAP = User._CONFIG.FIELD_MAP as Map<string, USchema>;

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
    let query: QuerySchema = {
        start_: 0,
        count_: 20,
        order_: 'id',
        by_: 'desc',
        idRN: '(1,2]',
        idMin: 200,                                 // id > 200
        idNot: 300,                                 // id != 300
        registerDateMin: '2022-01-01',              // registerDate > 2022-01-01
        registerDateMax: new Date('2022-02-01'),    // registerDate < 2022-02-01
        lastModifyRD: '2022-01-01',                 //
        lastModifyRM: '2022-01',                    //
        lastModifyRY: '2022',                       //
        nameLike: 'name',                           // name like %name%
        name: 'oor',                                // name = oor (No Suffix, No Magic )
        namea: 'oor',                               // will be ignored because field "namea" not exists



    };

    let [SQL, PARAM] = whereByQuery(query, FIELD_MAP, new Map());
    let [ORDERBY, LIMIT] = orderByLimit(FIELD_MAP, query);
    

    // console.log('SQL        : ', SQL);
    // console.log('PARAM      : ', PARAM,PARAM.length);
    // console.log('ORDERBY    : ', ORDERBY);
    // console.log('LIMIT      : ', LIMIT);

    console.log(`${SQL} ${ORDERBY} ${LIMIT}`)



    // buildQuery({ a: '1' })
})
    .pin()

    ;

