import { test } from 'node:test'
import _ from 'lodash';

import { COLUMN_MAP } from '../test/pg';
import { queryToCondition } from './QueryBuilder';
import { SUFFIX } from './types';
import type { QuerySchema } from './types';

test('Field Condition Suffix',
    {
        // only: true,
    }, () => {
        let query: any = {
            age: 1,
            keyword_: 'fdsa'
        };
        for (let suffix of SUFFIX) {
            query['age' + suffix] = 12;
            query['name' + suffix] = 'abc';
        }
        console.log(query)
        let condition = queryToCondition(query, COLUMN_MAP, new Map());
        console.log(condition)
        // console.log(condition.items.length);
        // const [sql, param] = where(condition);
        // console.log(sql, param)

        // let [ORDERBY, LIMIT] = orderByLimit(COLUMN_MAP, query);

    }
)





// test('Test : buildQuery', () => {
//     let query: QuerySchema = {
//         start_: 0,
//         count_: 20,
//         order_: 'id',
//         by_: 'desc',
//         idBt: '(1,2]',
//         sex: false,                                 // sex = false
//         idMin: 200,                                 // id > 200
//         idNot: 300,                                 // id != 300
//         registerDateMin: '2022-01-01',              // registerDate > 2022-01-01
//         registerDateMax: new Date('2022-02-01'),    // registerDate < 2022-02-01
//         lastModifyBtD: '2022-01-01',                 //
//         lastModifyBtM: '2022-01',                    //
//         lastModifyBtY: '2022',                       //
//         nameLike: 'name',                           // name like %name%
//         name: 'oor',                                // name = oor (No Suffix, No Magic )
//         // namea: 'oor',                               // will be ignored because field "namea" not exists
//     };

//     let condition = queryToCondition(query, COLUMN_MAP, new Map());
//     console.log(condition)
//     // let [ORDERBY, LIMIT] = orderByLimit(COLUMN_MAP, query);


//     // console.log('SQL        : ', SQL);
//     // console.log('PARAM      : ', PARAM,PARAM.length);
//     // console.log('ORDERBY    : ', ORDERBY);
//     // console.log('LIMIT      : ', LIMIT);

//     // console.log(`${SQL} ${ORDERBY} ${LIMIT}`)
//     // console.log(`${SQL}`)
//     // console.log(PARAM)


//     // buildQuery({ a: '1' })
// })

//     ;


