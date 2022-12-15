import { test, User } from '../test/mysql'


test('Test Mysql :  query', async () => {
    const result = await User.all();
    console.log(result)
})
    .pin()
;