import { test } from '@japa/runner';
import { formatDate } from './dateutil';
import dayjs from 'dayjs';
const DEFAULT_FORMAT = '';
// dayjs().toISOString();
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(timezone)

test('test date tz', ({ }, timezone) => {


    // console.log(new Intl.DateTimeFormat("en-US"));

    // // @ts-ignore
    // console.log(tz('2020-11-05T20:22:05.000Z', timezone).format('YYYY-MM-DD HH:mm:ss'))

    try {
        // @ts-ignore
        console.log(formatDate('2020-11-05T20:22:05', timezone))
    } catch (e) {
        console.log(e)
    }

})
    .with([
        'Etc/GMT+12',
        'America/Mexico_City',
        'Asia/Shanghai'
    ]

    )
    // .pin()
    ;