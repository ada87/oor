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
]);

const setRange = (query: QueryDslQueryContainer[], column: string, value: any, compare: COMPARE) => {
    let idx = _.findIndex(query, pro => pro.range != undefined && pro.range[column] != undefined);
    if (idx < 0) {
        query.push({ range: { [column]: { [compare]: value } } })
    } else {
        query[idx].range[column][compare] = value;
    }
}

// ES Will Not Support  IsDistinct / NotDistinct Suffix
const NotSuppportES = new Set<MagicSuffix>(['IsDistinct', 'NotDistinct']);

const NullCondition = (item: WhereItem, query: QueryDslQueryContainer[], err: string[]): boolean => {
    if (!NONE_PARAM.has(item.fn)) return false;
    if (NotSuppportES.has(item.fn)) {
        err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)

        return true;
    }
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
    if (item.value == '' || item.value == null) {
        // err.push(`${item.column}/(date) : Can not be null`)
        return;
    }
    let val: Dayjs = null;
    if (item.fn != 'Bt') {
        val = dayjs(item.value as any);
        if (!val.isValid()) {
            err.push(`${item.column}/(date) : Must Be a date-string or number-stamp ${item.value}`)
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
    const compare = RANGE_MAP.get(item.fn);
    if (compare != null) {
        setRange(query, item.column, val.format(), compare)
        return;
    }
    let start = null, end = null;
    switch (item.fn) {
        case 'BtD':
            start = val.startOf('date').format();
            end = val.endOf('date').format();
            break;
        case 'BtM':
            start = val.startOf('month').format();
            end = val.endOf('month').format();
            break;
        case 'BtY':
            start = val.startOf('year').format();
            end = val.endOf('year').format();
            break;
        case 'Bt':
            let range = betweenDate(item.value + '');
            range.map(ptn => {
                let compare = RANGE_MAP.get(ptn[0]);
                if (compare) {
                    setRange(query, item.column, ptn[1], compare)
                }
            })
            return;
        case '!=':
        case '<>':
        case 'Not':
            query.push({ bool: { must_not: { term: { [item.column]: val.toDate() } }, should: [] } })
            return;
        case '=':
            query.push({ term: { [item.column]: val.toDate() } })
            return;
        default:
            return;
    }
    setRange(query, item.column, start, 'lte')
    setRange(query, item.column, end, 'gte')
}

const ItemToWhere = (whereItem: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {
    let item = { ...whereItem, fn: whereItem.fn ? whereItem.fn : '=', type: whereItem.type ? whereItem.type : 'string' }
    if (!isSupport(item.type, item.fn) || NotSuppportES.has(item.fn)) {
        err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)
        return;
    }
    if (NullCondition(whereItem, query, err)) return;
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
