import { test } from 'tsest'
import _ from 'lodash'
// import { existsSync } from 'fs'
// import { isAbsolute, resolve } from 'path';
// import { initFromSQL } from './lib-sqlite/initDB'
import { SQLITE } from './sqlite'

import { UserSchema, } from './core/Schema.test';
import { RESERVED_WORDS } from './lib-pg/RESERVED_WORDS';

const USER = SQLITE.Table('user', UserSchema, { rowKey: 'id' });

test('sqlite action', async () => {
    var result;

    result = await USER.insert({ name: 'aa' })
    console.log(result)

})