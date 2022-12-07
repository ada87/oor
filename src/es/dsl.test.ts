import { test } from '@japa/runner'
import '@japa/assert'
import { WhereParam, QuerySchema, SUFFIX } from '../base/types'

// import { whereByQuery } from './QueryBuilder';
// import { orderByLimit } from './QueryPagition';
import { SUFFIX_COVER_TEST, isCoverOrCoverError } from '../test/Const';


test('Test : DSL', () => {

    // isCoverOrCoverError()
    const root: WhereParam = [
        { column: 'a1', fn: '<', value: 'value1' },
        { column: 'a2', fn: '<', value: 'value2' },
        {
            link: 'OR', items: [
                { column: 'b1', fn: 'Like', value: 'value3' },
                {
                    link: 'OR', items: [
                        { column: 'd1', value: 'test1' },
                        { column: 'd2', value: 'test2' },
                        {
                            link: 'AND', items: [
                                { column: 'e1', value: 'test6' },
                                { column: 'e2', value: 'test7' },

                            ]
                        }
                    ]
                },
                { column: 'b2', fn: '>=', value: 'value4' },
            ]
        },
        { column: 'a3', fn: '<', value: 'value1' },

    ]
    // console.log(root)
    // console.log('DSL BUILDER')
})
    // .pin()

    ;