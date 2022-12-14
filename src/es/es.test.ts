import { test, User } from '../test/es';
import dayjs from 'dayjs';
import _ from 'lodash';




// test('Test : Query With SQL', async () => {
//     const result = await User.sql(`SELECT * FROM  public.user WHERE name='陆磊'`);
//     console.log(result);
// })
// .skip();
;


test('Test : Basic', async () => {
    const result = await User.all();

    console.log(result);
})
    .skip()
    ;



test('Test : Query with QuerySchemma', async () => {
    // const result = await User.query({
    // console.log('aaa')
    let result;
    result = await User.queryPager({
        start_: 0,
        count_: 3,
        order_: 'age',
        by_: 'desc',
        // nameLikel: '陆',
        // sex: true,
        // ageBt: "[12,17]",
        nameNotIn:'朱,陆敏'
    });

    // result = await User.queryByField('name', '陆')


    // result = await User.getById('HNoA7IQB65L_VamPfysf');


    // console.log(result.list.map(item=>item._source));

    // const b = _.cloneDeep(a);

    // // console.log(b);

    // console.log(b == a)
    // console.log(b.u == a.u)
    // console.log(b.u.db == a.u.db)
    // console.log(_.isEqual(b.u.db, a.u.db))
    // console.log(b.u.c == a.u.c)
    // b.u.c = 1212;
    // console.log(b.u.c == a.u.c)





})
    // .pin()
    // .skip()
    ;


// test('Test : Query With Some Condition', async () => {
//     // const result = await User.getById(1);
//     const result = await User.getById(4);
//     // const result = await User.getByProperties('name', '陆磊');

//     // this three is same
//     // const result = await User.queryByProperties('name', '陆磊');
//     // const result = await User.queryByCondition([{ field: 'name', value: '陆磊' }]);
//     // const result = await User.queryByCondition({ link: 'AND', items: [{ field: 'name', value: '陆磊' }]});

//     console.log(result);
//     // console.log(result.length)

// })
//     .skip()
//     ;



test('Test : CRUD', async () => {
    // Insert
    // const insertResult = await User.insert({
    //     name: 'test',
    //     age: 23,
    //     sex: false,
    //     address: 'randmo',
    //     salary: 1221.2,
    // });
    // console.log('Insert Result', insertResult._id)
    // let userId = insertResult.id as number;



    const id = 'VNoA7IQB65L_VamPfysn';


    // const afterInsert = await User.getById(userId);
    // console.log('After Insert', afterInsert)

    // // Update
    // await new Promise(r => setTimeout(r, 1200)); // wait , notice last_update value
    // let isUpdate = await User.deleteById(id);    // change Age
    // console.log('Update is Success ? : ', isUpdate == 1);

    // const afterUpdate = await User.getById(id);
    // console.log('After Update', afterUpdate)

    const result = await User.query();
    console.log(result)

    // // Delete
    // let isDelete = await User.deleteById(userId);
    // console.log('Delete is Success ? : ', isDelete == 1);

    // await setTimeout(r => r, 1000); // wait , notice last_update value
    // const afterDelete = await User.getById(userId);
    // console.log('After Delete', afterDelete)
})


    .pin()
    // .skip()


    ;


// test('Test : Update 2', async () => {

//     const result = await User.update({ id: 1 });
//     // const result = await User.update({ id: 2 });
//     // const result = await User.updateByField({ age: 30 }, 'id', 2);
//     // const result = await User.updateByCondition({ age: 30 }, [{ field: 'id', condition: '<', value: 10 }]);
//     // const result = await User.updateByQuery({ age: 38 }, { idMax: 10, sex: false });
//     console.log(result)
// })
//     .skip()
//     ;


// test('Test : Delete 2', async () => {

//     // const result = await User.deleteById(1);
//     // const result = await User.deleteById(2);
//     // const result = await User.deleteByField('id', 3);
//     // const result = await User.deleteByQuery( { idMax: 10, sex: false });
//     const result = await User.deleteByCondition([{ column: 'id', fn: '<', value: 10 }]);
//     console.log(result)
// })
//     // .skip()
//     ;
