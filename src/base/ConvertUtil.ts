import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(timezone)

// export const tz=>{}
// https://day.js.org/docs/en/display/as-iso-string
// ISO 8601
// https://www.iana.org/time-zones
// https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
// https://github.com/iamkun/dayjs/blob/dev/src/plugin/utc/index.js
// https://github.com/iamkun/dayjs/blob/dev/src/plugin/timezone/index.js
// https://stackoverflow.com/questions/58847869/utc-vs-iso-format-for-time



// 'Etc/GMT+12',
// 'America/Mexico_City',
// 'Asia/Shanghai'
const TZ_MAP = new Map<string, string>([
    ['Etc/GMT+12', 'YYYY/MM/DD HH:mm:ss'],
    ['America/Mexico_City', 'MM/DD/YYYY HH:mm:ss'],
    ['Asia/Shanghai', 'YYYY-MM-DD HH:mm:ss'],
]);

export const formatDate = (date: string | Date | number, timezone: string): string => {
    return dayjs(date).tz(timezone).format(TZ_MAP.get(timezone))

}