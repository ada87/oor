import { test, User } from './test/pg';


test('Test : Basic', async () => {
    const result = await User.all();
    console.log(result);
})
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