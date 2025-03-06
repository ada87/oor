import { test, equal,equalAsync } from 'tsest'
import { UType } from './types'
import { newDate } from './TimeUtil'
import { getFieldType } from './SQLUtil';
import { bgYellow, colorGreen, colorRed, colorYellow } from './color';
import nodeAssert from 'node:assert';


// assert.

const getn = async () => new Promise(r=>{
    setTimeout(()=>{
        r(1)
    },800)
});
test('new Date', {}, async () => {

    const expect = new Date();
    const actual = newDate(UType.Date());

    await equalAsync(getn, [], 1)
    await equalAsync(getn, [], 3)
    equal(getn, [], 4)
    // nodeAssert.equal(actual, expect, `
    // Expected : ${expect}
    // Actual : ${actual}`)
    // assert.equal(true, true, `expect true actual false`)
    // assert.equal(expect, actual)
})



// test('Type', {
//     only: true
// }, () => {

//     // const bool = UType.Boolean();
//     console.log(getFieldType(UType.Boolean()));
//     // getFieldType(UType.String());
//     // getFieldType(UType.IntegerNotNull);
//     // getFieldType(UType.Date());
//     // getFieldType(UType.DateLong());
// GGGG


// })


// test('new Date', {}, () => {
//     const timeNumber = UType.DateLong();
//     const timeDate = UType.Date();
//     const timeString = UType.DateString();


//     console.log(getFieldType(timeNumber));
//     console.log(newDate(timeNumber));
//     console.log(newDate(timeDate));
//     console.log(newDate(timeString));
// })