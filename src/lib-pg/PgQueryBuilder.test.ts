import { test } from 'tsest'
import { PgQueryBuilder } from './PgQueryBuilder'

import { TABLE_NAME, TABLE_OPTIONS, DATABASE_OPTIONS, UserSchema } from '../utils/SQLUtil.test'

test('PgQueryBuilder', {
    only: true
}, async () => {
    const PG = new PgQueryBuilder(TABLE_NAME, UserSchema, TABLE_OPTIONS, DATABASE_OPTIONS)

    console.log(PG.select())
    // console.log('fdsa')

})