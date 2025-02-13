import { test } from 'tsest'
import { PgClient } from './index';


const client  = new PgClient({});
export const user  = client.Table();
test('connect client', {

}, async () => {

    
    // const conn = await client.getClient();
    // conn.query('SELECT NOW()', (err, res) => {
    // client.connect();
    // client.query('SELECT NOW()', (err, res) => {   
 })

