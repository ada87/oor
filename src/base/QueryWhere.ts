import _, { min } from 'lodash';
import { WhereItem, WhereCondition, MagicSuffix } from './types';
import { STRICT } from './Util';
import dayjs from 'dayjs';

type QueryPos = { SQL: string[]; PARAM: any[], NUM: number; }

const NOT_SUPPORT_TEXT = new Set<MagicSuffix>(['MinD', 'MinH', 'MinM', 'MaxD', 'MaxH', 'MaxM', 'BtD', 'BtM', 'BtY', 'Bt'])
const NOT_SUPPORT_NUMBER = new Set<MagicSuffix>(['MinD', 'MinH', 'MinM', 'MaxD', 'MaxH', 'MaxM', 'BtD', 'BtM', 'BtY', 'Like', 'Likel', 'Liker'])
const NOT_SUPPORT_DATE = new Set<MagicSuffix>(['Like', 'Likel', 'Liker', 'IsDistinct', 'NotDistinct'])

const compareSuffix = (suffix: MagicSuffix): MagicSuffix => {
    switch (suffix) {
        case '<':
        case '>':
        case '<=':
        case '>=':
        case '=':
            return suffix;
        case 'Min':
            return '>';
        case 'Max':
            return '<';
        case 'MinD':
        case 'MinH':
        case 'MinM':
        case 'MinThan':
            return '>=';
        case 'MaxD':
        case 'MaxH':
        case 'MaxM':
        case 'MaxThan':
            return '<=';
        case 'Not':
        case '!=':
        case '<>':
            return '!=';
    }
    return null;
}

const getStart = (str: string): [MagicSuffix, string] => {
    if (str.startsWith('(')) return ['>', str.substring(1)];
    if (str.startsWith('[')) return ['>=', str.substring(1)];
    return ['>=', str]
}
const getEnd = (str: string): [MagicSuffix, string] => {
    if (str.endsWith(')')) return ['<', str.substring(0, str.length - 1)];
    if (str.endsWith(']')) return ['<=', str.substring(0, str.length - 1)];
    return ['<=', str]
}

export const getRange = (txt: string): [MagicSuffix, string][] => {
    let str = _.trim((txt || ''));
    if (str.length == 0) return null;
    let ptns = str.split(',').map(_.trim);
    if (ptns.length > 2) return null;
    if (ptns.length == 1) return [getStart(ptns[0])];
    let result = [];
    if (ptns[0].length) result.push(getStart(ptns[0]));
    if (ptns[1].length) result.push(getEnd(ptns[1]));
    return result;
}

export const getNumberRange = (txt: string): [MagicSuffix, number][] => {
    let range = getRange(txt);
    if (range == null) return null;
    let result = [];
    for (let item of range) {
        try {
            let num = parseFloat(item[1]);
            result.push([item[0], num]);
        } catch {
            return null;
        }
    }
    return result;

}
export const getDateRange = (txt: string): [MagicSuffix, Date][] => {
    let range = getRange(txt);
    if (range == null) return null;
    let result = [];
    for (let item of range) {
        let day = dayjs(item[1])
        if (!day.isValid()) {
            return null;
        }
        result.push([item[0], day.toDate()]);
    }
    return result;
}


const whereText = (item: WhereItem, pos: QueryPos, err: string[]) => {
    if (NOT_SUPPORT_TEXT.has(item.condition)) {
        err.push(`${item.field}/ type : String not support method ${item.condition}`)
        return;
    }
    const compare = compareSuffix(item.condition);
    if (compare != null) {
        pos.SQL.push(`${item.field} ${compare} $${pos.NUM}`);
        pos.PARAM.push(item.value)
        pos.NUM++;
        return;
    }
    switch (item.condition) {
        case 'Like':
            pos.SQL.push(`${item.field} LIKE $${pos.NUM}`);
            pos.PARAM.push('%' + item.value + '%')
            pos.NUM++;
            break;
        case 'Likel':
            pos.SQL.push(`${item.field} LIKE $${pos.NUM}`);
            pos.PARAM.push('%' + item.value)
            pos.NUM++;
            break;
        case 'Liker':
            pos.SQL.push(`${item.field} LIKE $${pos.NUM}`);
            pos.PARAM.push(item.value + '%')
            pos.NUM++;
            break;
        case 'IsNull':
            pos.SQL.push(`${item.field} IS NULL`);
            break;
        case 'NotNull':
            pos.SQL.push(`${item.field} IS NOT NULL`);
            break;
        default:
            err.push(`${item.field}/ type : String not support method ${item.condition}`)
            return;
    }
}

const whereNumber = (item: WhereItem, pos: QueryPos, err: string[]) => {
    if (NOT_SUPPORT_NUMBER.has(item.condition)) {
        err.push(`${item.field}/ type : Number not support method ${item.condition}`)
        return;
    }
    const compare = compareSuffix(item.condition);
    if (compare != null) {
        try {
            let val = _.isNumber(item.value) ? item.value : parseFloat(item.value as string);
            pos.SQL.push(`${item.field} ${compare} $${pos.NUM}`);
            pos.PARAM.push(val)
            pos.NUM++;
        } catch {
            err.push(`${item.field}/ type : Number value is not a Number ${item.value}`)
        }
        return;
    }
    if (item.condition == 'IsNull') {
        pos.SQL.push(`${item.field} IS NULL`);
        return;
    }
    if (item.condition == 'NotNull') {
        pos.SQL.push(`${item.field} IS NOT NULL`);
        return;
    }
    if (item.condition == 'Bt') {
        let between = getRange(item.value + '');
        if (between == null) {
            err.push(`${item.field}/ type : Number Between Value invalidated ${item.value}`)
            return;
        }
        return;
    }
}

const whereDate = (item: WhereItem, pos: QueryPos, err: string[]) => {
    if (NOT_SUPPORT_DATE.has(item.condition)) {
        err.push(`${item.field}/ type : Date not support method ${item.condition}`)
        return;
    }
    // const compare = compareSuffix(item.condition);
    // if (compare != null) {
    //     if (item.value == '' || item.value == null) {
    //         err.push(`${item.field}/ Value Must Be a date-string or number-stamp ${item.value}`)
    //         return;
    //     }
    //     let val = dayjs(item.value as any);
    //     if (!val.isValid()) {
    //         err.push(`${item.field}/ Value Must Be a date-string or number-stamp ${item.value}`)
    //         return;
    //     }
    //     pos.SQL.push(`${item.field} ${compare} $${pos.NUM}`);
    //     pos.PARAM.push(val.toDate())
    //     pos.NUM++;
    //     return;
    // }
    if (item.condition == 'IsNull') {
        pos.SQL.push(`${item.field} IS NULL`);
        return;
    }
    if (item.condition == 'NotNull') {
        pos.SQL.push(`${item.field} IS NOT NULL`);
        return;
    }
    switch (item.condition) {
        case 'MaxD':
        case 'MaxH':
        case 'MaxM':
        case 'MinD':
        case 'MinH':
        case 'MinM':
        case 'Min':
        case 'Max':
        case 'MaxThan':
        case 'MinThan':
        case 'BtD':
        case 'BtM':
        case 'BtY':
        case 'Bt':
            break;
    }
    // if (item.condition == 'Bt') {
    //     let between = getRange(item.value + '');
    //     if (between == null) {
    //         err.push(`${item.field}/ type : Number Between Value invalidated ${item.value}`)
    //         return;
    //     }
    //     return;
    // }
}

const whereBoolean = (item: WhereItem, pos: QueryPos, err: string[]) => {
    // if (item.value === null || item.value === '') {
    //     return;
    // }
    let bool: boolean;
    if (_.isString(item.value)) {
        bool = !(item.value == '' || item.value == '0' || item.value == 'false');
    } else {
        bool = !!item.value;
    }
    if (item.condition == 'Not' || item.condition == '!=') {
        bool = !bool;
    }
    pos.SQL.push(`${item.field} IS ${bool ? '' : 'NOT'} TRUE`)
}

const ItemToWhere = (item: WhereItem, pos: QueryPos, err: string[]) => {
    if (item.type == 'boolean') {
        whereBoolean(item, pos, err);
        return;

    }
    if (item.condition == undefined || item.condition == null || item.condition == '=') {
        pos.SQL.push(`${item.field} = $${pos.NUM}`);
        pos.PARAM.push(item.value)
        pos.NUM++;
        return;
    }


    switch (item.type) {
        case 'number':
            whereNumber(item, pos, err);
            break;
        case 'string':
            whereText(item, pos, err);
            break;
        case 'date':
            whereDate(item, pos, err);
            break;
        default:
            whereText(item, pos, err);
            break;
    }

}




const ConditionToWhere = (condition: WhereCondition, pos: QueryPos, err: string[]) => {
    for (let group of condition.items) {
        if (_.has(group, 'link')) {
            let _pos: QueryPos = {
                SQL: [],
                PARAM: [],
                NUM: pos.NUM
            }
            ConditionToWhere(group as WhereCondition, _pos, err);
            if (_pos.NUM > pos.NUM) {
                pos.NUM = _pos.NUM;
                for (let param of _pos.PARAM) {
                    pos.PARAM.push(param);
                }
                //@ts-ignore;
                pos.SQL.push('(' + _pos.SQL.join(' ' + group.link + ' ') + ')')
            }


        } else {
            ItemToWhere(group as WhereItem, pos, err)

        }
    }
};


export const whereByCondition = (condition: (WhereCondition) | (WhereItem[]), startIdx = 1): [string, any[]] => {
    const pos: QueryPos = { SQL: [], PARAM: [], NUM: startIdx };
    let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
    let err: string[] = [];
    ConditionToWhere(root, pos, err);
    if (err.length) {
        if (STRICT) {
            throw new Error('Some SQL Error Occur', { cause: err })
        }
        // console.log(err)
    }
    if (pos.PARAM.length == 0) return ['', []];
    return ['WHERE ' + pos.SQL.join(" " + root.link + " "), pos.PARAM]
}
