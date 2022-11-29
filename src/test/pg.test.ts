import { pg, test } from './pg';


test('Test : pg', async () => {

    const resp = await pg.query('SHOW search_path')
    const { rowCount, rows, } = resp;
    // console.log(rowCount);
    if (rowCount == 1) {
        console.log(rows[0])
    }
})
// .pin();