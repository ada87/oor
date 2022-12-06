import { test, User } from './pg';

test('Test : Query With SQL', async () => {
    const result = await User.sql(`SELECT * FROM  public.user WHERE name='陆磊'`);
    console.log(result);


})
    .skip();
// .pin();


test('Test : Basic', async () => {
    const result = await User.all();

    console.log(result);
})
    // .pin()
    .skip();



test('Test : Query with QuerySchemma', async () => {
    // const result = await User.query({
    const result = await User.queryPager({
        count_: 5,
        order_: 'salary',
        by_: 'desc',
        nameLike: '陆',
        sex: false
    });
    console.log(result);

})
    .skip();
// .pin();


test('Test : Query With Some Condition', async () => {
    // const result = await User.getById(1);
    const result = await User.getById(4);
    // const result = await User.getByProperties('name', '陆磊');

    // this three is same
    // const result = await User.queryByProperties('name', '陆磊');
    // const result = await User.queryByCondition([{ field: 'name', value: '陆磊' }]);
    // const result = await User.queryByCondition({ link: 'AND', items: [{ field: 'name', value: '陆磊' }]});

    console.log(result);
    // console.log(result.length)

})
    .skip();
// .pin();



test('Test : CRUD', async () => {
    // Insert
    const insertResult = await User.insert({
        name: 'test',
        age: 23,
        sex: false,
        address: 'randmo',
        salary: 1221.2,
    });
    console.log('Insert Result', insertResult)
    let userId = insertResult.id as number;


    const afterInsert = await User.getById(userId);
    console.log('After Insert', afterInsert)

    // Update
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
// .skip();
// .pin();





test('Test : Update 2', async () => {

    const result = await User.update({ id: 1 });
    // const result = await User.update({ id: 2 });
    // const result = await User.updateByField({ age: 30 }, 'id', 2);
    // const result = await User.updateByCondition({ age: 30 }, [{ field: 'id', condition: '<', value: 10 }]);
    // const result = await User.updateByQuery({ age: 38 }, { idMax: 10, sex: false });
    console.log(result)
})
    .skip()
    // .pin()
    ;


test('Test : Delete 2', async () => {

    // const result = await User.deleteById(1);
    // const result = await User.deleteById(2);
    // const result = await User.deleteByField('id', 3);
    // const result = await User.deleteByQuery( { idMax: 10, sex: false });
    const result = await User.deleteByCondition([{ column: 'id', fn: '<', value: 10 }]);
    console.log(result)
})
    // .skip()
    // .pin()
    ;
