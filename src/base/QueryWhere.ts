import _ from 'lodash';
import { WhereItem, WhereCondition } from './types';

type QueryPos = {
    SQL: string[];
    PARAM: any[],
    NUM: number;
}


const ItemToWhere = (item: WhereItem, pos: QueryPos) => {
    if (item.fn) {
        
    }
    switch (item.operation) {
        case '<':
        case '<=':
        case '>':
        case '>=':
        case '=':
            pos.SQL.push(`${item.field} ${item.operation} $${pos.NUM}`);
            pos.PARAM.push(item.value)
            pos.NUM++;
            break
        case 'LIKE':
            pos.SQL.push(`${item.field} LIKE '%$${pos.NUM}%'`);
            pos.PARAM.push(item.value)
            pos.NUM++;
            break;
        default:
            // pos.SQL.push(`${item.field} = $${pos.NUM}`);
            // pos.PARAM.push(item.value)
            // pos.NUM++;
            break
    }
}




const ConditionToWhere = (condition: WhereCondition, pos: QueryPos) => {
    for (let group of condition.items) {
        if (_.has(group, 'link')) {
            let _pos: QueryPos = {
                SQL: [],
                PARAM: [],
                NUM: pos.NUM
            }
            ConditionToWhere(group as WhereCondition, _pos);
            if (_pos.NUM > pos.NUM) {
                pos.NUM = _pos.NUM;
                for (let param of _pos.PARAM) {
                    pos.PARAM.push(param);
                }
                //@ts-ignore;
                pos.SQL.push('(' + _pos.SQL.join(' ' + group.link + ' ') + ')')
            }


        } else {
            ItemToWhere(group as WhereItem, pos)

        }
    }
};


export const whereByCondition = (condition: (WhereCondition) | (WhereItem[]), startIdx = 1): [string, any[]] => {
    const pos: QueryPos = {
        SQL: [],
        PARAM: [],
        NUM: startIdx
    };

    let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
    ConditionToWhere(root, pos);
    if (pos.PARAM.length > 0) {
        return ['WHERE ' + pos.SQL.join(" " + root.link + " "), pos.PARAM]
    }
    return ['', []];
}
