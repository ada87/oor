import _ from '../core/dash';
import dayjs from 'dayjs';
import { NONE_PARAM, betweenDate, betweenNumber, boolValue, inNumber, inString } from '../utils/SQLUtil';
import { throwErr } from '../utils/ValidateUtil'
import { colorFieldName, colorFieldType, colorCondition } from '../utils/color'

import type { WhereItem, WhereParam, WhereCondition, MagicSuffix, Support, SQLStatement, } from '../utils/types';
import type { Dayjs } from 'dayjs';



type QueryPos = { SQL: Array<string>; PARAM: Array<any> };
// DOCS
export const SUFFIX_MATRIX: Record<MagicSuffix, Support> = {

    'Min': { string: true, double: true, integer: true, date: true, boolean: true },
    'Max': { string: true, double: true, integer: true, date: true, boolean: true },

    'Lt': { string: true, double: true, integer: true, date: true, boolean: true },
    'Lte': { string: true, double: true, integer: true, date: true, boolean: true },
    'Gt': { string: true, double: true, integer: true, date: true, boolean: true },
    'Gte': { string: true, double: true, integer: true, date: true, boolean: true },

    'Less': { string: true, double: true, integer: true, date: true, boolean: true },
    'LessThan': { string: true, double: true, integer: true, date: true, boolean: false },
    'More': { string: true, double: true, integer: true, date: true, boolean: true },
    'MoreThan': { string: true, double: true, integer: true, date: true, boolean: false },

    'MinH': { string: false, double: false, integer: false, date: true, boolean: false },
    'MinD': { string: false, double: false, integer: false, date: true, boolean: false },
    'MinM': { string: false, double: false, integer: false, date: true, boolean: false },
    'MaxH': { string: false, double: false, integer: false, date: true, boolean: false },
    'MaxD': { string: false, double: false, integer: false, date: true, boolean: false },
    'MaxM': { string: false, double: false, integer: false, date: true, boolean: false },

    'Like': { string: true, double: false, integer: false, date: false, boolean: false },
    'Likel': { string: true, double: false, integer: false, date: false, boolean: false },
    'Liker': { string: true, double: false, integer: false, date: false, boolean: false },

    'Bt': { string: false, double: true, integer: true, date: true, boolean: false },
    'BtD': { string: false, double: false, integer: false, date: true, boolean: false },
    'BtY': { string: false, double: false, integer: false, date: true, boolean: false },
    'BtM': { string: false, double: false, integer: false, date: true, boolean: false },

    'Not': { string: true, double: true, integer: true, date: true, boolean: true },

    'In': { string: true, double: true, integer: true, date: false, boolean: false },
    'NotIn': { string: true, double: true, integer: true, date: false, boolean: false },

    'IsNull': { string: true, double: true, integer: true, date: true, boolean: true },
    'NotNull': { string: true, double: true, integer: true, date: true, boolean: true },


    '>': { string: true, double: true, integer: true, date: true, boolean: true },
    '>=': { string: true, double: true, integer: true, date: true, boolean: false },
    '<': { string: true, double: true, integer: true, date: true, boolean: true },
    '<=': { string: true, double: true, integer: true, date: true, boolean: false },
    '=': { string: true, double: true, integer: true, date: true, boolean: true },
    '!=': { string: true, double: true, integer: true, date: true, boolean: true },
    '<>': { string: true, double: true, integer: true, date: true, boolean: true },

}

const isSupport = (item: WhereItem, err: Array<string>): boolean => {
    let suffix = SUFFIX_MATRIX[item.fn] || SUFFIX_MATRIX['='];
    if (suffix[item.type || 'string']) return true;
    err.push(`${colorFieldName(item.column)}/(${colorFieldType(item.type)}) do not support ${colorCondition(item.fn)}`)
    return false;
}

const NullCondition = (item: WhereItem, pos: QueryPos,): boolean => {
    if (!NONE_PARAM.has(item.fn)) return false;
    let bool = boolValue(item.value)
    switch (item.fn) {
        case 'IsNull':
            pos.SQL.push(`${item.column} IS ${bool ? '' : 'NOT'} NULL`);
            return true;
        case 'NotNull':
            pos.SQL.push(`${item.column} IS ${bool ? 'NOT' : ''} NULL`);
            return true;
        // case 'IsDistinct':
        //     pos.SQL.push(`${item.column} IS ${bool ? '' : 'NOT'} DISTINCT`);
        //     return true;
        // case 'NotDistinct':
        //     pos.SQL.push(`${item.column} IS ${bool ? 'NOT' : ''} DISTINCT`);
        //     return true;

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
        case 'More':
        case 'Gt':
            return '>'
        case 'Less':
        case 'Lt':
            return '<'
        case 'Min':
        case 'MoreThan':
        case 'Gte':
        case 'MinD':
        case 'MinH':
        case 'MinM':
            return '>=';
        case 'MaxD':
        case 'MaxH':
        case 'MaxM':
        case 'Max':
        case 'LessThan':
        case 'Lte':
            return '<=';
        case 'Not':
        case '!=':
        case '<>':
            return '!=';
    }
    return null;
}


const InFn = new Map<MagicSuffix, string>([['In', 'IN'], ['NotIn', 'NOT IN']]);

const whereText = (item: WhereItem, pos: QueryPos, err: Array<string>) => {
    const compare = compareSuffix(item.fn);
    if (compare != null) {
        pos.SQL.push(`${item.column} ${compare} ?`);
        pos.PARAM.push(item.value)
        return;
    }
    if (InFn.has(item.fn)) {
        pos.SQL.push(`${item.column} ${InFn.get(item.fn)} ( ? )`);
        pos.PARAM.push(inString(item.value + ''))
        // pos.NUM++;
        return
    }
    switch (item.fn) {
        case 'Like':
            pos.SQL.push(`${item.column} LIKE ?`);
            pos.PARAM.push('%' + item.value + '%')
            return;
        case 'Likel':
            pos.SQL.push(`${item.column} LIKE ?`);
            pos.PARAM.push(item.value + '%')

            return;
        case 'Liker':
            pos.SQL.push(`${item.column} LIKE ?`);
            pos.PARAM.push('%' + item.value)
            return;
        default:
            err.push(`${colorFieldName(item.column)}/ type : ${colorFieldType('String')} not support method ${colorCondition(item.fn)}`)
            return;
    }
}

const whereNumber = (item: WhereItem, pos: QueryPos, err: Array<string>, parseFn: (value: string) => number) => {
    const compare = compareSuffix(item.fn);
    if (compare != null) {
        try {
            let val = _.isNumber(item.value) ? item.value : parseFn(item.value as string);
            pos.SQL.push(`${item.column} ${compare} ?`);
            pos.PARAM.push(val)
        } catch {
            err.push(`${item.column}/ type : Number value is not a Number ${item.value}`)
        }
        return;
    }
    if (InFn.has(item.fn)) {
        pos.SQL.push(`${item.column} ${InFn.get(item.fn)} ( ? )`);
        pos.PARAM.push(inNumber(item.value + ''))
        return
    }
    if (item.fn == 'Bt') {
        let range = betweenNumber(item.value + '', parseFn);
        if (range == null) {
            err.push(`${item.column}/(Number) :  Between Value invalidated ${item.value}`)
            return;
        }
        range.map(oper => {
            pos.SQL.push(`${item.column} ${oper[0]} ?`)
            pos.PARAM.push(oper[1])
        })
        return;
    }
    err.push(`${colorFieldName(item.column)}/(${colorFieldType(item.type || 'number')}) : not support method ${colorCondition(item.fn)}`);
}



const whereDate = (item: WhereItem, pos: QueryPos, err: Array<string>) => {
    let val: Dayjs = null;
    if (item.fn != 'Bt') {
        if (item.value == '' || item.value == null) {
            err.push(`${colorFieldName(item.column)}/(${colorFieldType(item.type || 'date')})  : Can not be null`)
            return;
        }
        val = dayjs(item.value as any);
        if (!val.isValid()) {
            err.push(`${colorFieldName(item.column)}/(${colorFieldType(item.type || 'date')})  : Must Be a date-string or number-stamp ${colorCondition(item.value)}`)
            return;
        }
        switch (item.fn) {
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
                val = val.endOf('hour');
                break;
            case 'MaxD':
                val = val.endOf('date');
                break;
            case 'MaxM':
                val = val.endOf('month');
                break;
        }
    }
    const compare = compareSuffix(item.fn);
    if (compare != null) {
        pos.SQL.push(`${item.column} ${compare} ?`);
        pos.PARAM.push(val.toDate())
        return;
    }
    let start = null, end = null;

    switch (item.fn) {
        case 'BtD':
            start = val.startOf('date').toDate();
            end = val.endOf('date').toDate();
            break;
        case 'BtM':
            start = val.startOf('month').toDate();
            end = val.endOf('month').toDate();
            break;
        case 'BtY':
            start = val.startOf('year').toDate();
            end = val.endOf('year').toDate();
            break;
        case 'Bt':
            const range = betweenDate(item.value + '')
            if (range == null) {
                err.push(`${colorFieldName(item.column)}/(${colorFieldType(item.type || 'date')})   :  Between Value invalidated ${colorCondition(item.value)}`)
                return;
            }
            range.map(oper => {
                pos.SQL.push(`${item.column} ${oper[0]} ?`)
                pos.PARAM.push(oper[1])
            })
            return;
    }
    if (start == null || end == null) {
        err.push(`${colorFieldName(item.column)}/(${colorFieldType(item.type || 'date')})   : not support method ${colorCondition(item.fn)}`);
        return;
    }
    pos.SQL.push(`${item.column} >= ?`)
    pos.PARAM.push(start)
    pos.SQL.push(`${item.column} <= ?`)
    pos.PARAM.push(end)
}

const whereBoolean = (item: WhereItem, pos: QueryPos, err: Array<string>) => {
    let bool = boolValue(item.value)
    switch (item.fn) {
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
    pos.SQL.push(`${item.column} ${bool ? '!=' : '='} 0`)


}

const ItemToWhere = (whereItem: WhereItem, pos: QueryPos, err: Array<string>) => {
    let item = { ...whereItem, fn: whereItem.fn ? whereItem.fn : '=', type: whereItem.type ? whereItem.type : 'string' }
    if (!isSupport(item, err)) return;
    if (NullCondition(item, pos)) return;
    switch (item.type) {
        case 'double':
            whereNumber(item, pos, err, parseFloat);
            return
        case 'integer':
            whereNumber(item, pos, err, parseInt);
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

const ConditionToWhere = (where: WhereCondition, pos: QueryPos, err: Array<string>) => {
    for (let item of where.items) {
        if (_.has(item, 'link')) {
            let group = item as WhereCondition;
            let _pos: QueryPos = {
                SQL: [],
                PARAM: [],
            }
            ConditionToWhere(group, _pos, err);
            if (_pos.SQL.length) {
                for (let param of _pos.PARAM) pos.PARAM.push(param);
                // let link = group.link == 'NOT' ? 'AND NOT' : group.link;
                pos.SQL.push('(' + _pos.SQL.join(' ' + group.link + ' ') + ')')
            }
        } else {
            ItemToWhere(item as WhereItem, pos, err)
        }
    }
};


export const where = (STRICT: boolean, condition: WhereParam): SQLStatement => {
    const pos: QueryPos = { SQL: [], PARAM: [], };
    let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
    let err: Array<string> = [];
    ConditionToWhere(root, pos, err);
    throwErr(STRICT, err, 'Some SQL Error Occur');
    if (pos.SQL.length == 0) {
        return ['', []]
    };
    return [pos.SQL.join(" " + root.link + " "), pos.PARAM]
}



// export const fixWhere = (COLUMN_MAP: Map<string, Column>, extra: WhereItem[]): [string, string] => {
//     let ITEMS: WhereItem[] = [];
//     let ctf = new Map<string, string>();
//     const convert = (kind, value) => {
//         switch (kind) {
//             case 'Boolean':
//                 return value;
//             case 'Number':
//                 return parseFloat(value);
//             case 'Integer':
//                 return parseInt(value);
//             default:
//                 return value + '';
//         }
//     }
//     for (let [key, val] of COLUMN_MAP) {
//         if (_.has(val, 'delMark')) {
//             ITEMS.push({ column: (val.column || key), fn: '<>', value: convert(val[Kind as any], val.delMark) })
//         }
//         ctf.set((val.column || key), key);
//     }
//     extra.map(item => {
//         // inner usage field
//         // @ts-ignore
//         let schema = COLUMN_MAP.get(item.field) || COLUMN_MAP.get(ctf.get(item.field));
//         if (schema == null) return;
//         ITEMS.push({ ...item, value: convert(schema[Kind as any], item.value) });
//     })
//     if (ITEMS.length == 0) return ['', ' WHERE '];
//     let [SQL, PARAM] = where(ITEMS);
//     if (SQL.length == 0) return ['', ' WHERE '];
//     PARAM.map((item, i) => {
//         SQL = SQL.replaceAll(`$${i + 1}`, _.isNumber(item) ? (item + '') : `'${item}'`)
//     });
//     return [' WHERE ' + SQL, ' AND ']
// }
