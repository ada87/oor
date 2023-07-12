import '@japa/assert';
// import { test, User, MODE, SUFFIX_MATRIX } from './test/pg';
import { test, User, MODE, SUFFIX_MATRIX } from './test/mysql';
// import { test, User, MODE,SUFFIX_MATRIX } from './test/es';
import { QueryCover } from './test/Const';
import { setup } from './base/Util';


test(`${MODE} Test : Query With SQL`, async () => {
    const result = await User.sql(`SELECT * FROM  public.user WHERE name='陆磊'`);
    console.log(result);
})
    // .skip();
    ;


test(`${MODE} Test : Basic`, async () => {
    const result = await User.all();

    console.log(result);
});


test(`${MODE} Test : Query`, async () => {
    const result = await User.query({ count_: 3, nameLiker: '伟' })

    console.log(result);
})
    ;

test(`${MODE} Test : Query with QuerySchemma`, async ({ assert }) => {

    // @ts-ignore
    setup({ strict: true })
    // await assert.rejects(async () => {
    //     const result = await User.query({ nameMinH: '赵' });
    //     console.log(result)
    // })

    // return;




    const asserts = QueryCover(SUFFIX_MATRIX)
    for (let [query, support] of asserts) {

        if (support) {
            console.log(`${MODE} should support : `, query)
            await assert.doesNotRejects(async () => {
                let result = await User.query({ ...query, count_: 1 });
                console.log(result)
            })
        } else {
            console.log(`${MODE} should not support : `, query)
            await assert.rejects(async () => {
                let result = await User.query({ ...query, count_: 1 });
                console.log(result)
            })
        }

        // console.log(query, support)
    }
    // console.log(asserts)

    // const result = await User.query({
    // const result = await User.query({
    //     count_: 5,
    //     order_: 'salary',
    //     by_: 'desc',
    //     ageIn: '64,21',
    //     // nameIn: '秦磊,苏平'

    //     // nameLike: '陆',
    //     // sex: false
    // });
    // console.log(result);

})
    // .skip()
    ;


test(`${MODE} Test : Query With Some Condition`, async () => {

    // const result = await User.getById(1);

    const result = await User.query({ order_: 'age', by_: 'desc', start_: 12, count_: 5 })
    // const result = await User.getById(1);
    // const result = await User.getByProperties('name', '陆磊');

    // this three is same
    // const result = await User.queryByProperties('name', '陆磊');
    // const result = await User.queryByCondition([{ field: 'name', value: '陆磊' }]);
    // const result = await User.queryByCondition({ link: 'AND', items: [{ field: 'name', value: '陆磊' }]});


    console.log(result);
    // console.log(result.length)

})
    ;



test(`${MODE} Test : CRUD`, async () => {
    // add
    const addResult = await User.add({
        name: 'test',
        age: 23,
        sex: false,
        address: 'randmo',
        salary: 1221.2,
    });
    // console.log('Add Result', addResult)
    let userId = addResult.id as number;


    const afterAdd = await User.getById(userId);
    console.log('After Add', afterAdd)

    // // Update
    await new Promise(r => setTimeout(r, 1200)); // wait , notice last_update value
    let isUpdate = await User.update({ id: userId, age: 60, });    // change Age
    console.log('Update is Success ? : ', isUpdate == 1);

    const afterUpdate = await User.getById(userId);
    console.log('After Update', afterUpdate)

    // Delete
    let isDelete = await User.deleteById(userId);
    console.log('Delete is Success ? : ', isDelete == 1);

    await setTimeout(r => r, 1000); // wait , notice last_update value
    const afterDelete = await User.getById(userId);
    console.log('After Delete', afterDelete)
})
// .pin()
// .skip();





test(`${MODE} Test : Update 2`, async () => {

    const result = await User.update({ id: 1 });
    // const result = await User.update({ id: 2 });
    // const result = await User.updateByField({ age: 30 }, 'id', 2);
    // const result = await User.updateByCondition({ age: 30 }, [{ field: 'id', condition: '<', value: 10 }]);
    // const result = await User.updateByQuery({ age: 38 }, { idMax: 10, sex: false });
    console.log(result)
})
    ;


test(`${MODE} Test : Delete 2`, async () => {

    // const result = await User.deleteById(1);
    // const result = await User.deleteById(2);
    // const result = await User.deleteByField('id', 3);
    // const result = await User.deleteByQuery( { idMax: 10, sex: false });
    const result = await User.deleteByCondition([{ column: 'id', fn: '<', value: 10 }]);
    console.log(result)
})
    // .skip()
    ;
