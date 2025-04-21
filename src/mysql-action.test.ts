import { test, assert } from 'tsest'
import _ from 'lodash'

import { SQLITE, setSQLLogger } from './sqlite'
import { UserSchema, } from './core/Schema.test';

setSQLLogger(console.log);

const USER = SQLITE.Table('user', UserSchema, { rowKey: 'id' });

test('sqlite action', async () => {
    var result;

    // result = await USER.update({ name: 'aa', id: 10232 }, 'COUNT')
    // assert.equal(result, 1)

    // result = await USER.update({ name: 'aa', id: 10232 }, 'INFO')
    // console.log(result)
    // assert.equal(result.name, 'aa')

    // result = await USER.update({ name: 'aa', id: 10232 }, 'KEY')
    // assert.equal(result.id, 10232)
    // assert.equal(result.name, undefined)

    // result = await USER.update({ name: 'aa', id: 10232 }, 'ORIGIN')
    // assert.equal(JSON.stringify(result), JSON.stringify({ lastInsertRowid: 0, changes: 1 }))

    // result = await USER.update({ name: 'aa', id: 10232 }, 'SUCCESS')
    // assert.equal(result, true)
    // console.log(result)

})