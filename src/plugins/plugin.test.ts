import { test } from '@japa/runner';
import { Pool, Client } from 'pg';
import * as _ from 'lodash';

test('Test : Pg Connection', async () => {
    var pg = new Client({
        host: process.env.PG_HOST || 'pgserver',
        port: parseInt(process.env.PG_PORT || '5432'),
        user: process.env.PG_USER || 'postgres',
        database: process.env.PG_DB || 'oor',

    });
    // pg.connect(err => {
    //     console.log('a1', err)
    //     pg.connect(err => {
    //         console.log('a2', err)
    //         pg.end(() => console.log('a3', err));

    //     })
    // })

    // console.log('start connect ')
    // // console.log(pg)
    // let a = await pg.connect();
    // console.log(a)
    // console.log('connected')
    // let b = await pg.connect();
    // console.log(b)
    // console.log(' connected ')
    // // console.log(pg);
    // await pg.end()
    // console.log('ended ')
})
    ;
