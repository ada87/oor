// import { test } from 'tsest';
// import _ from 'lodash';
// import { UserSchema } from '../test/Const';
// import { checkEntity } from './Util';

// // id: UType.Number(),
// // name: UType.String({ maxLength: 32 }),
// // age: UType.Number({ minimum: 0, maximum: 128 }),
// // sex: UType.Boolean(),
// // profile: UType.String({ ignore: true }),
// // address: UType.String({ maxLength: 128 }),
// // salary: UType.Number(),
// // registerDate: UType.Date({ column: 'register_date', isCreate: true }),
// // lastModify: UType.Date({ column: 'last_modify', isModify: true })

// test('Test : Check', ({ assert }, obj) => {
//     checkEntity(UserSchema, obj)
// })
//     .with([
//         { id: 1 },
//         { id: 'abc' },
//         { id: false },
//         { id: new Date() },
//         { name: 1 },
//         { name: 'abc' },
//         { name: _.repeat('abc', 20) },
//         { name: false },
//         { name: new Date() },
//     ])


//     ;



// test('Test : Between Number', ({ assert }, txt) => {
//     // console.log(txt, getNumberRange(txt as any))

//     // let query: any = {};
//     // for (let suffix of SUFFIX) {
//     //     query['age' + suffix] = 12;
//     //     // query['name' + suffix] = 'abc';
//     // }
//     // const query: any = { ageBt: txt }
//     // // console.log(query)
//     // let condition = queryToCondition(query, FIELD_MAP, new Map());
//     // // console.log(condition)
//     // // console.log(condition.items.length);
//     // const [sql, param] = where(condition);
//     // console.log(query.ageBt, sql, param)


// }).with([
//     '',
//     '0,20',
//     '0,',
//     ',20',
//     '(0,20',
//     '[0,20',
//     '0,20)',
//     '0,20]',
//     '[0,20]',
//     '(0,20)',
//     '0,20,df,fads',
// ])
//     ;

// test('Test : Between Date', ({ assert }, txt) => {
//     // console.log(txt, betweenDate(txt as any))
// }).with([
//     '',
//     '2022-11-11,2022-11-12',
//     '2022-11-11 11:11:11,2022-11-12 12:12',
//     '[2022-11-11,2022-11-12]',
//     '(2022-11-11,2022-11-12)',
//     '0,20,df,fads',
// ])
//     ;

