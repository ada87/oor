import { client, test, User } from '../test/es';



test('Test : Elastich Search Query', async () => {
    // let result: any = null;
    // let result = await User.sql({
    //     script_fields: {
    //         a: {
    //             script: { lang: 'painless', source: `doc['age'].value` }
    //         }
    //     }
    // });
    // console.log(result.length)
    // console.log(result.length)


    let result = await User.all();
    // result.hits.hits[0]._source?.lastModify
    console.log(result)

})

    // .pin()
    ;



