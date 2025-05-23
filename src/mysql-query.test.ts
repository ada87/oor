import { test, assert } from 'tsest'
import _ from 'lodash'
// import { existsSync } from 'fs'
// import { isAbsolute, resolve } from 'path';
// import { initFromSQL } from './lib-mysql/initDB'
// import { SQLITE, setSQLLogger } from './mysql'

import { UserSchema, } from './core/Schema.test';
setSQLLogger(console.log);

const USER = SQLITE.View('user', UserSchema, { rowKey: 'id' });

test('mysql getter', {
    skip: true
}, async () => {
    var result;

    // result = await USER.getById(1)
    // console.log(result);


    // result = await USER.getByField('name', '白芳');
    // console.log(result)

    // result = await USER.getByQuery({ age: 55, salaryMoreThan: 10000 });
    // console.log(result)

    // result = await USER.getByWhere([{ column: 'name', value: '白芳', fn: '=' }]);
    // console.log(result)

})


test('mysql query',
    { skip: true, },
    async () => {
        var result;

        // result = await USER.query({ _count: 2 });
        // assert.equal(result.length, 2);


        // result = await USER.queryPagination();
        // assert.equal(result.list.length, 20);

        result = await USER.queryPagination({ ageLte: 55, salaryMoreThan: 1000 });
        // console.log(result)
        assert.equal(result.list.length, 20);
    })

