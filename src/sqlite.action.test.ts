import { test } from 'tsest'
import _ from 'lodash'
// import { existsSync } from 'fs'
// import { isAbsolute, resolve } from 'path';
// import { initFromSQL } from './lib-sqlite/initDB'
import { SQLITE } from './sqlite'

import { UserSchema, } from './core/Schema.test';

const USER = SQLITE.View('user', UserSchema, { rowKey: 'id' });

test('sqlite action', async () => {
    var result;
})