import _ from 'lodash';
import { SqlWhere } from '../base/sql';
import { WhereParam, WhereItem, WhereCondition, MagicSuffix, FieldType, } from '../base/types';
import { throwErr, isSupport, NONE_PARAM } from '../base/Util';
import dayjs, { Dayjs } from 'dayjs';
// COMING 

type QueryPos = { SQL: string[]; PARAM: any[], }

// 'Min', 'MinThan', 'Max', 'MaxThan',                 // commom  > , >= , <  ,  <=
// 'MinH', 'MinD', 'MinM', 'MaxH', 'MaxD', 'MaxM',     // Only Date Hour / Day / Month
// 'Like', 'Likel', 'Liker',                           // Only String  like leftlike rightlike
// 'Bt', 'BtD', 'BtY', 'BtM',                          // BETWEEN, support Number/Date ,'BtY', 'BtM', 'BtD' Only  Spport Date
// 'Not',                                              // != or <>
// 'IsNull', 'NotNull',                                // isNull or Not NULL           This Suffix will avoid value
// 'IsDistinct', 'NotDistinct',                        // isDistinct or Not Distinct   This Suffix will avoid value
// '>', '>=', '<', '<=', '=', '!=', '<>'    
const OPERATION_MAP = new Map<MagicSuffix, string>([
    ['Min', 'gt'],
    ['MinThan', 'gte'],
    ['Max', 'lt'],
    ['MaxThan', 'lte'],
    ['MinH', 'gte'],
    ['MinD', 'gte'],
    ['MinM', 'gte'],
    ['MaxH', 'lte'],
    ['MaxD', 'lte'],
    ['MaxM', 'lte'],
    ['Like', 'wildcard'],
    ['Likel', 'prefix'],
    ['Liker', 'wildcard'],
    ['Bt', 'between'],
    ['BtD', 'between'],
    ['BtY', 'between'],
    ['BtM', 'between'],
    // ['Not', 'Must Not'],
    ['IsNull', 'exist'],
    // ['NotNull', 'exist'],
    // ['IsDistinct', 'gt'],
    // ['NotDistinct', 'gt'],
    ['>', 'gt'],
    ['>=', 'gte'],
    ['<', 'lt'],
    ['<=', 'lte'],
    ['=', 'term'],
    ['!=', 'gt'],
    ['<>', 'gt'],
])


const TERMS = "{\"terms\":{\"field\":\"%s\",\"size\":%d,\"min_doc_count\":1,\"shard_min_doc_count\":0,\"show_term_doc_count_error\":false,\"order\":[{\"_count\":\"desc\"}]}}";






const ItemToWhere = (whereItem: WhereItem, pos: QueryPos, err: string[]) => {
    let item = { ...whereItem, fn: whereItem.fn ? whereItem.fn : '=', type: whereItem.type ? whereItem.type : 'string' }
    if (!isSupport(item.type, item.fn)) {
        err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)
        return;
    }
    switch (item.type) {
        case 'number':
            // whereNumber(item, pos, err);
            return;
        case 'string':
            // whereText(item, pos, err);
            return;
        case 'boolean':
            // whereBoolean(item, pos, err);
            return
        case 'date':
            // whereDate(item, pos, err);
            return;
        default:
            // whereText(item, pos, err);
            return;
    }
}

const ConditionToWhere = (condition: WhereCondition, pos: QueryPos, err: string[]) => {
    for (let group of condition.items) {
        if (_.has(group, 'link')) {
            let _pos: QueryPos = {
                SQL: [],
                PARAM: [],
            }
            ConditionToWhere(group as WhereCondition, _pos, err);
            if (_pos.SQL.length) {
                // for (let param of _pos.PARAM) {
                //     pos.PARAM.push(param);
                // }
                //@ts-ignore;
                pos.SQL.push('(' + _pos.SQL.join(' ' + group.link + ' ') + ')')
            }


        } else {
            ItemToWhere(group as WhereItem, pos, err)

        }
    }
};



export const where: SqlWhere = (condition: WhereParam, startIdx?): [string, any[]] => {
    const pos: QueryPos = { SQL: [], PARAM: [], };
    let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
    let err: string[] = [];
    // ConditionToWhere(root, pos, err);
    // throwErr(err, 'Some SQL Error Occur');
    // if (pos.SQL.length == 0) return ['', []];
    // return [pos.SQL.join(" " + root.link + " "), pos.PARAM]
    return null;
}
