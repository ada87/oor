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



test('Test : Query', async () => {
    const result = await User.query({
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


test('Test : Query With Pagition', async () => {
    const result = await User.queryPager({
        count_: 100,
        order_: 'salary',
        by_: 'desc',
        nameLikel: '陆磊',
        sex: false
    });
    console.log(result);

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
    .skip();
    // .pin();
    