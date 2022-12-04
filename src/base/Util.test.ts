import { test } from '@japa/runner'
import _ from 'lodash';
import { UserSchema } from '../test/pg';
import { checkEntity } from './Util';

// id: UType.Number(),
// name: UType.String({ maxLength: 32 }),
// age: UType.Number({ minimum: 0, maximum: 128 }),
// sex: UType.Boolean(),
// profile: UType.String({ ignore: true }),
// address: UType.String({ maxLength: 128 }),
// salary: UType.Number(),
// registerDate: UType.Date({ column: 'register_date', isCreate: true }),
// lastModify: UType.Date({ column: 'last_modify', isModify: true })

test('Test : Check', ({ assert }, obj) => {
    checkEntity(UserSchema, obj)

})
    .with([
        { id: 1 },
        { id: 'abc' },
        { id: false },
        { id: new Date() },
        { name: 1 },
        { name: 'abc' },
        { name: _.repeat('abc', 20) },
        { name: false },
        { name: new Date() },
    ])

    // .pin()

    ;