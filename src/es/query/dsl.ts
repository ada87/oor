import type { QueryDslQueryContainer, QueryDslBoolQuery } from '@elastic/elasticsearch/lib/api/types';
import _, { filter } from 'lodash';
import { WhereParam, WhereItem, WhereCondition, MagicSuffix, FieldType, } from '../../base/types';
import { throwErr, isSupport, NONE_PARAM } from '../../base/Util';
import dayjs, { Dayjs } from 'dayjs';

// https://www.elastic.co/guide/en/elasticsearch/reference/8.5/query-dsl.html
// COMING 


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
]);


const RANGE_MAP = new Map<MagicSuffix, string>([
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

    // ['Like', 'wildcard'],
    // ['Likel', 'prefix'],
    // ['Liker', 'wildcard'],
    // ['Bt', 'between'],
    // ['BtD', 'between'],
    // ['BtY', 'between'],
    // ['BtM', 'between'],
    // ['Not', 'Must Not'],
    // ['IsNull', 'exist'],
    // ['NotNull', 'exist'],
    // ['IsDistinct', 'gt'],
    // ['NotDistinct', 'gt'],
    ['>', 'gt'],
    ['>=', 'gte'],
    ['<', 'lt'],
    ['<=', 'lte'],
    // ['=', 'term'],
    ['!=', 'gt'],
    ['<>', 'gt'],
]);



const TERMS = "{\"terms\":{\"field\":\"%s\",\"size\":%d,\"min_doc_count\":1,\"shard_min_doc_count\":0,\"show_term_doc_count_error\":false,\"order\":[{\"_count\":\"desc\"}]}}";


const whereText = (item: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {
    if (RANGE_MAP.has(item.fn)) {
        err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)
        return;
    }
    let action = OPERATION_MAP.get(item.fn);

    switch (action) {
        case 'wildcard':
            query.push({ wildcard: { [item.column]: item.value + '' } });
            break;
        case 'term':
            query.push({ term: { [item.column]: item.value + '' } })
    }
    // query.push({ [action]: {} })

    // query.push({
    //     range: {
    //         [item.column]: {
    //             gte: item.value,
    //             lte: item.value,
    //         }
    //     }
    // })
}



const ItemToWhere = (whereItem: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {
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
            // query.term = {}
            // query.push({
            //     wildcard: {

            //     }
            // })
            // query.push({})
            // (query.filter).push({ term: { 'd': {} } })
            whereText(item, query, err);
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

const ConditionToWhere = (root: WhereCondition, query: QueryDslQueryContainer[], err: string[]) => {
    for (let group of root.items) {
        if (_.has(group, 'link')) {
            let children: QueryDslQueryContainer[] = [];
            ConditionToWhere(group as WhereCondition, children, err);
            if (children.length == 0) {
                continue;
            }
            if (children.length == 1) {
                query.push(children[0]);
            }
            if (root.link == 'OR') {
                query.push({ bool: { should: children } });
            }
            query.push({ bool: { filter: children } } as QueryDslQueryContainer);
        } else {
            ItemToWhere(group as WhereItem, query, err)

        }
    }
};



export const where = (condition: WhereParam): QueryDslQueryContainer => {

    let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
    let query: QueryDslQueryContainer[] = [];
    let err: string[] = [];
    ConditionToWhere(root, query, err);
    throwErr(err, 'Some DSL Error Occur');
    if (query.length == 0) {
        return { match_all: {} }
    }
    if (query.length == 1) {
        return { constant_score: { filter: query[0] } }
    }
    if (root.link == 'OR') {
        return { constant_score: { filter: { bool: { should: query } } } };
    }
    return { constant_score: { filter: { bool: { filter: query, should: [] } } } }




}
