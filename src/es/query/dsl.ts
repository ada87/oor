import type { QueryDslQueryContainer, QueryDslBoolQuery } from '@elastic/elasticsearch/lib/api/types';
import _ from 'lodash';
import { WhereParam, WhereItem, WhereCondition, MagicSuffix, FieldType, } from '../../base/types';
import { throwErr, isSupport, NONE_PARAM, betweenDate, betweenNumber, boolValue } from '../../base/Util';
import dayjs, { Dayjs } from 'dayjs';

// https://www.elastic.co/guide/en/elasticsearch/reference/8.5/query-dsl.html


type COMPARE = 'lt' | 'lte' | 'gt' | 'gte';

const RANGE_MAP = new Map<MagicSuffix, COMPARE>([
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
    ['>', 'gt'],
    ['>=', 'gte'],
    ['<', 'lt'],
    ['<=', 'lte'],
    // ['!=', 'gt'],
    // ['<>', 'gt'],
]);

const setRange = (query: QueryDslQueryContainer[], column: string, value: any, compare: COMPARE) => {
    let idx = _.findIndex(query, pro => pro.range != undefined && pro.range[column] != undefined);
    if (idx < 0) {
        query.push({ range: { [column]: { [compare]: value } } })
    } else {
        query[idx].range[column][compare] = value;
    }
}


const TERMS = "{\"terms\":{\"field\":\"%s\",\"size\":%d,\"min_doc_count\":1,\"shard_min_doc_count\":0,\"show_term_doc_count_error\":false,\"order\":[{\"_count\":\"desc\"}]}}";

const NullCondition = (item: WhereItem, query: QueryDslQueryContainer[]): boolean => {
    if (!NONE_PARAM.has(item.fn)) return false;
    let bool = boolValue(item.value)
    switch (item.fn) {
        case 'IsNull':
            break;
        case 'NotNull':
            break;
    }
    if (bool) {
        query.push({ bool: { should: [{ exists: { field: item.column } }, { term: { [item.column]: null } }], minimum_should_match: 1 } })
    } else {
        query.push({ bool: { must_not: { exists: { field: item.column } }, should: [] } })
    }
    return true;
}


const whereText = (item: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {
    if (NullCondition(item, query)) return;
    switch (item.fn) {
        case 'Not':
            query.push({ bool: { must_not: { term: { [item.column]: item.value + '' } }, should: [] } })
            break;
        case 'Like':
            query.push({ wildcard: { [item.column]: item.value + '' } });
            break;
        case 'Likel':
            query.push({ prefix: { [item.column]: item.value + '' } })
            break;
        case 'Liker':
            query.push({ wildcard: { [item.column]: '*' + item.value } })
            break;
        case '=':
            query.push({ term: { [item.column]: item.value + '' } })
            break;
        default:
            err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)
            break;
    }
}


const whereNumber = (item: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {
    if (NullCondition(item, query)) return;
    let compare = RANGE_MAP.get(item.fn);
    if (compare) {
        let value = parseFloat(item.value as any);
        setRange(query, item.column, value, compare)
        return;
    }
    if (item.fn == 'Bt') {
        let range = betweenNumber(item.value + '');
        range.map(ptn => {
            let compare = RANGE_MAP.get(ptn[0]);
            if (compare) {
                setRange(query, item.column, ptn[1], compare)
            }
        })
        return;
    }
    switch (item.fn) {
        case '!=':
        case '<>':
            query.push({ bool: { must_not: { term: { [item.column]: item.value } }, should: [] } })
            break;
        case '=':
            query.push({ term: { [item.column]: item.value } });
            break;
        default:
            err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)
            break;
    }
}
const whereBoolean = (item: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {
    if (NullCondition(item, query)) return;
    let bool = boolValue(item.value);
    switch (item.fn) {
        case '<':
        case 'Min':
        case '>':
        case 'Max':
        case 'Not':
        case '!=':
        case '<>':
            query.push({ term: { [item.column]: !bool } })
            break;
        case '=':
            query.push({ term: { [item.column]: bool } })
            break;
        default:
            err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)
            return;
    }


}

const whereDate = (item: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {

}


const ItemToWhere = (whereItem: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {
    let item = { ...whereItem, fn: whereItem.fn ? whereItem.fn : '=', type: whereItem.type ? whereItem.type : 'string' }
    if (!isSupport(item.type, item.fn)) {
        err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)
        return;
    }
    switch (item.type) {
        case 'number':
            whereNumber(item, query, err);
            return;
        case 'string':
            whereText(item, query, err);
            return;
        case 'boolean':
            whereBoolean(item, query, err);
            return
        case 'date':
            whereDate(item, query, err);
            return;
        default:
            whereText(item, query, err);
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
                query.push({ bool: { should: children, minimum_should_match: 1 } });
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
