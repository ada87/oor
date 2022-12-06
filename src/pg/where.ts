import type { WhereParam, WhereItem, WhereCondition, MagicSuffix } from '../base/types';
import type { Dayjs } from 'dayjs';

import _ from 'lodash';
import { SqlWhere } from '../base/sql';
import { throwErr, NONE_PARAM, isSupport } from '../base/Util';
import dayjs from 'dayjs';


// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';
// dayjs.extend(utc)
// dayjs.extend(timezone)

type QueryPos = { SQL: string[]; PARAM: any[], NUM: number; }

const BOOLEAN_TEXT_IGNORE = new Set(['', 'null']);
const BOOLEAN_TEXT_FALSE = new Set<any>(['0', 'false', '-1']);

const NullCondition = (item: WhereItem, pos: QueryPos,): boolean => {
    if (!NONE_PARAM.has(item.condition)) return false;
    let bool = true
    if (_.isString(item.value)) {
        let v = _.toLower(_.trim(item.value));
        if (BOOLEAN_TEXT_IGNORE.has(v)) return;
        if (BOOLEAN_TEXT_FALSE.has(v)) bool = false;
    } else {
        bool = !!item.value;
    }
    switch (item.condition) {
        case 'IsNull':
            pos.SQL.push(`${item.column} IS ${bool ? '' : 'NOT'} NULL`);
            return true;
        case 'NotNull':
            pos.SQL.push(`${item.column} IS ${bool ? 'NOT' : ''} NULL`);
            return true;
        case 'IsDistinct':
            pos.SQL.push(`${item.column} IS ${bool ? '' : 'NOT'} DISTINCT`);
            return true;
        case 'NotDistinct':
            pos.SQL.push(`${item.column} IS ${bool ? 'NOT' : ''} DISTINCT`);
            return true;

    }

}


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

export const between = (txt: string): [MagicSuffix, string][] => {
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

export const betweenNumber = (txt: string): [MagicSuffix, number][] => {
    let range = between(txt);
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
export const betweenDate = (txt: string): [MagicSuffix, Date][] => {
    let range = between(txt);
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
    if (NullCondition(item, pos)) return;
    const compare = compareSuffix(item.condition);
    if (compare != null) {
        pos.SQL.push(`${item.column} ${compare} $${pos.NUM}`);
        pos.PARAM.push(item.value)
        pos.NUM++;
        return;
    }
    switch (item.condition) {
        case 'Like':
            pos.SQL.push(`${item.column} LIKE $${pos.NUM}`);
            pos.PARAM.push('%' + item.value + '%')
            pos.NUM++;
            return;
        case 'Likel':
            pos.SQL.push(`${item.column} LIKE $${pos.NUM}`);
            pos.PARAM.push(item.value + '%')
            pos.NUM++;
            return;
        case 'Liker':
            pos.SQL.push(`${item.column} LIKE $${pos.NUM}`);
            pos.PARAM.push('%' + item.value)
            pos.NUM++;
            return;
        default:
            err.push(`${item.column}/ type : String not support method ${item.condition}`)
            return;
    }
}

const whereNumber = (item: WhereItem, pos: QueryPos, err: string[]) => {
    if (NullCondition(item, pos)) return;
    const compare = compareSuffix(item.condition);
    if (compare != null) {
        try {
            let val = _.isNumber(item.value) ? item.value : parseFloat(item.value as string);
            pos.SQL.push(`${item.column} ${compare} $${pos.NUM}`);
            pos.PARAM.push(val)
            pos.NUM++;
        } catch {
            err.push(`${item.column}/ type : Number value is not a Number ${item.value}`)
        }
        return;
    }
    if (item.condition == 'Bt') {
        let range = betweenNumber(item.value + '');
        if (range == null) {
            err.push(`${item.column}/(Number) :  Between Value invalidated ${item.value}`)
            return;
        }
        range.map(oper => {
            pos.SQL.push(`${item.column} ${oper[0]} $${pos.NUM}`)
            pos.PARAM.push(oper[1])
            pos.NUM++;
        })
        return;
    }
    err.push(`${item.column}/(Number) : not support method ${item.condition}`);
}



const whereDate = (item: WhereItem, pos: QueryPos, err: string[]) => {
    if (NullCondition(item, pos)) return;
    let val: Dayjs = null;
    if (item.condition != 'Bt') {
        if (item.value == '' || item.value == null) {
            err.push(`${item.column}/(date) : Can not be null`)
            return;
        }
        val = dayjs(item.value as any);
        if (!val.isValid()) {
            err.push(`${item.column}/(date) : Must Be a date-string or number-stamp ${item.value}`)
            return;
        }
        switch (item.condition) {
            case 'MinH':
                val = val.startOf('hour');
                break;
            case 'MinD':
                val = val.startOf('date');
                break;
            case 'MinM':
                val = val.startOf('month');
                break;
            case 'MaxH':
                val = val.endOf('month');
                break;
            case 'MaxD':
                val = val.endOf('month');
                break;
            case 'MaxM':
                val = val.endOf('month');
                break;
        }
    }
    const compare = compareSuffix(item.condition);
    if (compare != null) {
        pos.SQL.push(`${item.column} ${compare} $${pos.NUM}`);
        pos.PARAM.push(val.toDate())
        pos.NUM++;
        return;
    }
    let start = null, end = null;

    switch (item.condition) {
        case 'BtD':
            start = val.clone().startOf('date').toDate();
            end = val.clone().endOf('date').toDate();
            break;
        case 'BtM':
            start = val.clone().startOf('month').toDate();
            end = val.clone().endOf('month').toDate();
            break;
        case 'BtY':
            start = val.clone().startOf('year').toDate();
            end = val.clone().endOf('year').toDate();
            break;
        case 'Bt':
            const range = betweenDate(item.value + '')
            if (range == null) {
                err.push(`${item.column}/(Date) :  Between Value invalidated ${item.value}`)
                return;
            }
            range.map(oper => {
                pos.SQL.push(`${item.column} ${oper[0]} $${pos.NUM}`)
                pos.PARAM.push(oper[1])
                pos.NUM++;
            })
            return;
    }
    if (start == null || end == null) {
        err.push(`${item.column}/(Date) : not support method ${item.condition}`);
        return;
    }

    pos.SQL.push(`${item.column} >= $${pos.NUM}`)
    pos.PARAM.push(start)
    pos.NUM++;
    pos.SQL.push(`${item.column} <= $${pos.NUM}`)
    pos.PARAM.push(end)
    pos.NUM++;


}

const whereBoolean = (item: WhereItem, pos: QueryPos, err: string[]) => {
    if (NullCondition(item, pos)) return;
    let bool = true;
    if (_.isString(item.value)) {
        let v = _.toLower(_.trim(item.value));
        if (BOOLEAN_TEXT_IGNORE.has(v)) return;
        if (BOOLEAN_TEXT_FALSE.has(v)) bool = false;
    } else {
        bool = !!item.value;
    }
    switch (item.condition) {
        case 'IsNull':
            pos.SQL.push(`${item.column} IS ${bool ? '' : 'NOT'} NULL`);
            return;
        case 'NotNull':
            pos.SQL.push(`${item.column} IS ${bool ? 'NOT' : ''} NULL`);
            return;
        case '!=':
        case '<>':
        case 'Not':
        case 'Min':
        case 'Max':
        case '>':
        case '<':
            bool = !bool;
            break;
        default:
            break;
    }
    pos.SQL.push(`${item.column} IS ${bool ? '' : 'NOT'} TRUE`)


}

const ItemToWhere = (whereItem: WhereItem, pos: QueryPos, err: string[]) => {
    let item = { ...whereItem, condition: whereItem.condition ? whereItem.condition : '=', type: whereItem.type ? whereItem.type : 'string' }
    if (!isSupport(item.type, item.condition)) {
        err.push(`${item.column}/(${item.type}) not support method ${item.condition}`)
        return;
    }
    switch (item.type) {
        case 'number':
            whereNumber(item, pos, err);
            return;
        case 'string':
            whereText(item, pos, err);
            return;
        case 'boolean':
            whereBoolean(item, pos, err);
            return
        case 'date':
            whereDate(item, pos, err);
            return;
        default:
            whereText(item, pos, err);
            return;
    }
}

const ConditionToWhere = (condition: WhereCondition, pos: QueryPos, err: string[]) => {
    for (let item of condition.items) {
        if (_.has(item, 'link')) {
            let group = item as WhereCondition;
            let _pos: QueryPos = {
                SQL: [],
                PARAM: [],
                NUM: pos.NUM
            }
            ConditionToWhere(group, _pos, err);
            if (_pos.SQL.length) {
                if (_pos.NUM > pos.NUM) pos.NUM = _pos.NUM;
                for (let param of _pos.PARAM) pos.PARAM.push(param);
                let link = group.link == 'NOT' ? 'AND NOT' : group.link;
                pos.SQL.push('(' + _pos.SQL.join(' ' + link + ' ') + ')')
            }
        } else {
            ItemToWhere(item as WhereItem, pos, err)
        }
    }
};


export const where: SqlWhere = (condition: WhereParam, startIdx = 1): [string, any[]] => {
    const pos: QueryPos = { SQL: [], PARAM: [], NUM: startIdx };
    let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
    let err: string[] = [];
    ConditionToWhere(root, pos, err);
    throwErr(err, 'Some SQL Error Occur');
    if (pos.SQL.length == 0) return ['', []];
    return [pos.SQL.join(" " + root.link + " "), pos.PARAM]
}
