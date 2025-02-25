import { test } from 'tsest'
import { UType } from '../utils/types'
import { newDate } from '../utils/TimeUtil'
import { getFieldType } from '../utils/SQLUtil';

test('Type', {
    only: true
}, () => {

    const bool = UType.Boolean();




})


test('new Date', {}, () => {
    const timeNumber = UType.DateLong();
    const timeDate = UType.Date();
    const timeString = UType.DateString();


    console.log(getFieldType(timeNumber));
    console.log(newDate(timeNumber));
    console.log(newDate(timeDate));
    console.log(newDate(timeString));
})