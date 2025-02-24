import test from 'node:test';


import { TABLE_NAME, TABLE_OPTIONS, UserSchema } from '../core/Schema.test';
import { PG, RETURN } from '../pg';



test('action', {
    only: true

}, async () => {

    const USER = PG.Table(TABLE_NAME, UserSchema, TABLE_OPTIONS);


    // const where = USER.BUILDER.convertQuery({ sex: true });
    // const statement = USER.BUILDER.where(where);

    // USER.BUILDER.where(where);
    // USER.BUILDER.where(where);
    // USER.BUILDER.where(where);
    // console.log(statement)
    // // console.log(USER.getDB().getOption())
    // const info = await USER.add({ name: '张丽', age: 18, }, RETURN.KEY)
    // console.log(info)

    // var data = await USER.getById(10244);
    // console.log(data)

    // const user = { id: 10242, name: '1111', profile: 'fddasfadsf', address: '', age: Math.floor(Math.random() * 100) } as any
    // 
    // const result = await USER.update(user, RETURN.SUCCESS, true)

    // console.log(result);

    // const result1 = await USER.deleteByField('sex', true);
    // console.log(result1)



    // const result2 = await USER.deleteByField('sex', 1, RETURN.SUCCESS);
    // console.log(result2)



    const result2 = await USER.deleteById({ id: 10242 });
    // console.log(result2)


    // data = await USER.getById(10244);
    // console.log(data)

    // console.log(isSuccess)
    // const userId = await USER.add({ name: '张丽', age: 18, }, RETURN.SUCCESS)
    // console.log(userId)

    // const userInfo = await USER.add({ name: '张丽', age: 18, }, RETURN.SUCCESS)
    // console.log(userInfo)

    // const insertCount = await USER.add({ name: '张丽', age: 18, }, RETURN.COUNT)
    // console.log(insertCount)


})