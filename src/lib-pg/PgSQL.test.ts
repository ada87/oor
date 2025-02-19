import { test } from 'tsest'
import { PgQuery } from './PgSQL'

import { TABLE_NAME, TABLE_OPTIONS, DATABASE_OPTIONS, UserSchema } from '../core/Schema.test'

test('PgQueryBuilder', {
    only: true
}, async () => {
    const PG = new PgQuery(TABLE_NAME, UserSchema, TABLE_OPTIONS, DATABASE_OPTIONS)

    console.log(PG.select())
    // console.log('fdsa')

})