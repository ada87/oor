import { test, User } from '../test/es';



test('Test : Elastich Search Query', async () => {
    // let result: any = null;
    let result = await User.sql({});
    // console.log(result.length)
    // console.log(result.length)


    // result.hits.hits[0]._source?.lastModify
    console.log(result)

})

    .pin()


    ;