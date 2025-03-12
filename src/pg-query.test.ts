import { test, assert } from 'tsest'
import { PG, setSQLLogger } from './pg';
import { UserSchema, } from './core/Schema.test';

const USER = PG.Table('public.user', UserSchema,);

setSQLLogger(console.log);

test('pg getter', {
    skip: true
}, async () => {
    var result;

    result = await USER.getById(1)
    console.log(result);


    result = await USER.getByField('name', '白芳');
    console.log(result)

    result = await USER.getByQuery({ age: 55, salaryMoreThan: 10000 });
    console.log(result)

    result = await USER.getByWhere([{ column: 'name', value: '白芳', fn: '=' }]);
    console.log(result)

})


test('pg query', async () => {
    var result;

    // result = await USER.query({ _count: 2 });
    // assert.equal(result.length, 2);


    result = await USER.queryPagination();
    assert.equal(result.list.length, 20);

    // result = await USER.queryPagination({ ageLte: 55, salaryMoreThan: 1000 });
    // assert.equal(result.list.length, 20);
})

