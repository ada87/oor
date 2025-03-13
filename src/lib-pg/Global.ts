type LogSQLParam = (sql: string, param: Array<any>) => void;
type LogSQLTime = (sql: string, param: Array<any>, time: number) => void;
import { colorGreen, bgGray, colorFieldName, styleItalic, } from '../utils/color';

export const GLOBAL = {
    logSQL: null,
    logTime: (sql: string, param: Array<any>, time: number) => {
        console.log(colorFieldName(time + 'ms'), styleItalic(bgGray(colorGreen(sql))), param,)
    }
}

/**
 * SQL Logger will run before SQL EXECUTE
 * * DEFAULT NULL
*/
export const setSQLLogger = (fn: LogSQLParam) => {
    if (typeof fn !== 'function') {
        GLOBAL.logSQL = null;
    } else {
        GLOBAL.logSQL = fn;
    }

}
/**
 * SQL Timer will run after SQL EXECUTE
 * DEFAULT : console.log(time,sql,param)
*/
export const setSQLTimer = (fn: LogSQLTime) => {
    if (typeof fn !== 'function') {
        GLOBAL.logTime = null;
    } else {
        GLOBAL.logTime = fn;
    }
}