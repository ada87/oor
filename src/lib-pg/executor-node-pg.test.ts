import { test, assert } from 'tsest';

import { PG } from '../pg';
import { PG_QUERY, PG_EXECUTOR } from './executor-node-pg';


test('test query',
    {
        skip: true
    }, async () => {
        const conn = await PG.getConn();
        var result;

        result = await PG_QUERY.query(conn, 'SELECT id,name FROM public.user WHERE age > 20 ORDER BY "id" DESC LIMIT 2',);
        console.log(result);


        result = await PG_QUERY.query(conn, 'SELECT id,name FROM public.user WHERE age>$1 ORDER BY "id" DESC LIMIT 2', [20]);
        console.log(result);
    }
);





test('test executor',
    {
        // skip: true
    }, async () => {
        const conn = await PG.getConn();
        var result;

        result = await PG_EXECUTOR.execute(conn, 'SELECT id,name FROM public.user WHERE age > 20 ORDER BY "id" DESC LIMIT 2',);
        console.log(result);


        result = await PG_EXECUTOR.execute(conn, 'SELECT id,name FROM public.user WHERE age>$1 ORDER BY "id" DESC LIMIT 2', [20]);
        console.log(result);
    }
);