import { test, pg } from './test/pg';
import { setup, BaseTable, UType, Static } from './index';
const UserSchema = UType.Table({
    id: UType.Number(),
    name: UType.String({ maxLength: 32 }),
    age: UType.Number({ minimum: 0, maximum: 128 }),
    sex: UType.Boolean(),
    profile: UType.String({ ignore: true }),
    address: UType.String({ maxLength: 128 }),
    salary: UType.Number(),
    registerDate: UType.Date({ column: 'register_date', isCreate: true }),
    lastModify: UType.Date({ column: 'last_modify', isModify: true })
});                                                 // Line 1
type User = Static<typeof UserSchema>;              // Line 2
const User = new BaseTable('user', UserSchema);     // Line 3

test('Test : Basic', async () => {
    setup({ provider: () => pg });
    const result = await User.all();
    console.log(result);

})



test('Test : Query', async () => {
    setup({ provider: () => pg });
    const result = await User.query({
        count_: 5,
        order_: 'salary',
        by_: 'desc',
        nameLike: '陆',
        sex: false
    });
    console.log(result);

})
    .pin();