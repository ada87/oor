// npm i mysql2

import type { Connection, FieldPacket } from 'mysql2/promise'
// import { Pool } from 'pg'

const conn: Connection = null;;

const run = async () => {

    const result = await conn.query('SELECT * FROM `table`', [1, 2, 2])
    const rows = result[0]
    const fileds = result[1]
    fileds.map((field: FieldPacket) => {
        console.log(field.name)
    })
}