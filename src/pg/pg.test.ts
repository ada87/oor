import { test } from 'tsest'
import { PG } from './index';
import { UserSchema } from '../base/Util.test'

const USER = PG.Table('public.user', UserSchema);

test('connect client', {
    only: true
}, async () => {
    // console.log(USER)
    // console.log(PG)
    const user = await USER.getById(1);

    const result = await USER.update({ ...user, name: 'TEST' },true)
    console.log(result)
    // console.log(user)

    // console.log(config)
})

