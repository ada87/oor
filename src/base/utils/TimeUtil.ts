import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import type { Dayjs } from 'dayjs'

dayjs.extend(utc)
dayjs.extend(timezone)

const DEFAULT_TIMEZONE = dayjs.tz.guess();

// export const tz=>{}
// https://day.js.org/docs/en/display/as-iso-string
// ISO 8601
// https://www.iana.org/time-zones
// https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
// https://github.com/iamkun/dayjs/blob/dev/src/plugin/utc/index.js
// https://github.com/iamkun/dayjs/blob/dev/src/plugin/timezone/index.js
// https://stackoverflow.com/questions/58847869/utc-vs-iso-format-for-time


const TZ_MAP = new Map<string, string>([
    ['Etc/GMT+12', 'YYYY/MM/DD HH:mm:ss'],
    ['America/Mexico_City', 'MM/DD/YYYY HH:mm:ss'],
    ['Asia/Shanghai', 'YYYY-MM-DD HH:mm:ss'],
]);


export const setFormat = (timezone: string, formater: string) => {
    TZ_MAP.set(timezone, formater)
}


export const convertDate = (date: string | Date | number | Dayjs, timezone: string = DEFAULT_TIMEZONE): string => {
    return dayjs(date).tz(timezone).format(TZ_MAP.get(timezone))
}