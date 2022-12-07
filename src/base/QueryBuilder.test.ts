import _ from 'lodash';
import { test } from '@japa/runner'
import '@japa/assert'

import { FIELD_MAP } from '../test/pg';
import { queryToCondition } from './QueryBuilder';
import { SUFFIX } from './types';
import type { QuerySchema } from './types';
import { where } from '../pg/where'

test('Test : Suffix Cover', ({ assert }) => {
    let query: any = {};
    for (let suffix of SUFFIX) {
        query['age' + suffix] = 12;
        // query['name' + suffix] = 'abc';
    }
    // console.log(query)
    let condition = queryToCondition(query, FIELD_MAP, new Map());
    // console.log(condition)
    // console.log(condition.items.length);
    const [sql, param] = where(condition);
    console.log(sql, param)

    // let [ORDERBY, LIMIT] = orderByLimit(FIELD_MAP, query);

})
    .skip()
    ;





test('Test : buildQuery', ({ assert }) => {
    let query: QuerySchema = {
        start_: 0,
        count_: 20,
        order_: 'id',
        by_: 'desc',
        idRN: '(1,2]',
        sex: false,                                 // sex = false
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

    let condition = queryToCondition(query, FIELD_MAP, new Map());
    // let [ORDERBY, LIMIT] = orderByLimit(FIELD_MAP, query);


    // console.log('SQL        : ', SQL);
    // console.log('PARAM      : ', PARAM,PARAM.length);
    // console.log('ORDERBY    : ', ORDERBY);
    // console.log('LIMIT      : ', LIMIT);

    // console.log(`${SQL} ${ORDERBY} ${LIMIT}`)
    // console.log(`${SQL}`)
    // console.log(PARAM)


    // buildQuery({ a: '1' })
})

    ;


