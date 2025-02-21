import test from 'node:test';

import { TABLE_NAME, TABLE_OPTIONS, UserSchema } from '../core/Schema.test';
import { PG, RETURN } from '../pg';





test('add', {
    only: true

}, async () => {

    const USER = PG.Table(TABLE_NAME, UserSchema, TABLE_OPTIONS);

    // console.log(USER.getDB().getOption())
    const isSuccess = await USER.add({ name: '张丽', age: 18, }, RETURN.OBJECT_KEY)
    console.log(isSuccess)

    console.log(isSuccess)
    // const userId = await USER.add({ name: '张丽', age: 18, }, RETURN.IS_SUCCESS)
    // console.log(userId)

    // const userInfo = await USER.add({ name: '张丽', age: 18, }, RETURN.IS_SUCCESS)
    // console.log(userInfo)

    // const insertCount = await USER.add({ name: '张丽', age: 18, }, RETURN.EFFECT_COUNT)
    // console.log(insertCount)


})