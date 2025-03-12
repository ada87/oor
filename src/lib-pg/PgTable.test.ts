import test from 'node:test';
import _ from 'lodash';


import { TABLE_NAME, TABLE_OPTIONS, UserSchema } from '../core/Schema.test';
import { PG, ReturnType } from '../pg';



test('action', {
    only: true

}, async () => {

    // const USER = PG.Table(TABLE_NAME, UserSchema, TABLE_OPTIONS);


    // const where = USER.BUILDER.convertQuery({ sex: true });
    // USER.BUILDER.convertQuery({ sexNot: true });
    // const where = USER.BUILDER.convertQuery({ sexLike: true,ageLessThan:10 });

    // USER.BUILDER.convertQuery({ : true });
    // USER.BUILDER.convertQuery({ sex: true });
    // const statement = USER.BUILDER.where(where);
    // console.log(statement)

    // USER.BUILDER.where(where);
    // USER.BUILDER.where(where);
    // USER.BUILDER.where(where);
    // console.log(statement)
    // // console.log(USER.getDB().getOption())
    // const info = await USER.add({ name: '张丽', age: 18, }, 'KEY')
    // console.log(info)

    // var data = await USER.getById(10244);
    // console.log(data)

    // const user = { id: 10242, name: '1111', profile: 'fddasfadsf', address: '', age: Math.floor(Math.random() * 100) } as any
    
    // const result = await USER.update(user, 'SUCCESS', true)

    // console.log(result);

    // const result1 = await USER.deleteByWhere(null as any, 'INFO');
    // console.log(result1)



    // const result2 = await USER.deleteByField('sex', 1, 'SUCCESS');
    // console.log(result2)



    // const result2 = await USER.deleteById({ id: 10242 }, 'COUNT');

    // console.log(result2)


    // data = await USER.getById(10244);
    // console.log(data)

    // console.log(isSuccess)
    // const userId = await USER.add({ name: '张丽', age: 18, }, 'SUCCESS')
    // console.log(userId)

    // const userInfo = await USER.insert({ name: '张丽', age: 18, }, 'INFO')
    // console.log(userInfo)

    // const userInfo = await USER.update({ id: 10297, age: _.random(100), }, 'SUCCESS');
    // userInfo
    // console.log(userInfo)

    // 10297

    // const insertCount = await USER.add({ name: '张丽', age: 18, }, 'COUNT')
    // console.log(insertCount)


    // const info = await USER.insertBatch([
    //     // { name: '张丽', age: 18, },
    //     { name: '张五', age: _.random(1000), salary: _.random(1000), sex: true, profile: 'fdslkjfads', address: 'fdsafadse' }
    // ], 'COUNT')
    // console.log(info)

})