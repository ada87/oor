// import { test, describe, beforeEach, afterEach } from 'node:test'
// import assert from 'node:assert'
// import { WhereParam, QuerySchema, SUFFIX } from '../../base/types'
// import { where, fixWhere, buildSearch } from './dsl'
// import { setup } from '../../base/Util'

// beforeEach
// // beforeEach(())
// test('A', (ctx) => {
//     ctx.before()
// })

// // import { whereByQuery } from './QueryBuilder';
// // import { orderByLimit } from './QueryPagition';
// import { isCoverOrCoverError } from '../../test/Const';


// test('Test : DSL', () => {
//     for (let suf of SUFFIX) {

//         const root: WhereParam = [
//             { column: 'last_modify', value: '2021-12-12 12:12:12', type: 'date', fn: suf },
//         ]
//         console.log(JSON.stringify(where(root)));
//     }
// })
//     ;

// test('Test : DSL', () => {

//     // isCoverOrCoverError()
//     const root: WhereParam = [
//         { column: 'a1', fn: '<', value: 'value1' },
//         { column: 'a2', fn: '<', value: 'value2' },
//         {
//             link: 'OR', items: [
//                 { column: 'b1', fn: 'Like', value: 'value3' },
//                 {
//                     link: 'OR', items: [
//                         { column: 'd1', value: 'test1' },
//                         { column: 'd2', value: 'test2' },
//                         {
//                             link: 'AND', items: [
//                                 { column: 'e1', value: 'test6' },
//                                 { column: 'e2', value: 'test7' },

//                             ]
//                         }
//                     ]
//                 },
//                 { column: 'b2', fn: '>=', value: 'value4' },
//             ]
//         },
//         { column: 'a3', fn: '<', value: 'value1' },

//     ]
//     console.log(JSON.stringify(where(root), null, 1))
//     // console.log(root)
//     // console.log('DSL BUILDER')
// })

//     ;

// test('fix Where', ({ }, param: any) => {
//     console.log(JSON.stringify(fixWhere(param)))
// })
//     .with([
//         [{ column: 'age', type: 'int', value: 12 }],
//         [{ column: 'age', type: 'int', fn: '<', value: 12 }],
//         [{ column: 'age', type: 'int', fn: '<>', value: 12 }],
//     ])
//     ;