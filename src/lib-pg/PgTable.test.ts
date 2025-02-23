import test from 'node:test';


import { TABLE_NAME, TABLE_OPTIONS, UserSchema } from '../core/Schema.test';
import { PG, RETURN } from '../pg';





test('add', {
    only: true

}, async () => {

    const USER = PG.Table(TABLE_NAME, UserSchema, TABLE_OPTIONS);


    // // console.log(USER.getDB().getOption())
    // const info = await USER.add({ name: '张丽', age: 18, }, RETURN.KEY)
    // console.log(info)

    var data = await USER.getById(10244);
    console.log(data)

    const result = await USER.update({ ...data, age: Math.floor(Math.random() * 100) },RETURN.ORIGIN)
    console.log(result);

    data = await USER.getById(10244);
    console.log(data)

    // console.log(isSuccess)
    // const userId = await USER.add({ name: '张丽', age: 18, }, RETURN.SUCCESS)
    // console.log(userId)

    // const userInfo = await USER.add({ name: '张丽', age: 18, }, RETURN.SUCCESS)
    // console.log(userInfo)

    // const insertCount = await USER.add({ name: '张丽', age: 18, }, RETURN.COUNT)
    // console.log(insertCount)


})