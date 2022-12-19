import type { QueryDslQueryContainer, QueryDslBoolQuery, SearchRequest, Field } from '@elastic/elasticsearch/lib/api/types';
import type { OrderByLimit } from './define'
import type { Dayjs } from 'dayjs';

import _ from 'lodash';
import { WhereParam, WhereItem, WhereCondition, MagicSuffix, FieldType, Support } from '../../base/types';
import { throwErr, NONE_PARAM, betweenDate, betweenNumber, boolValue, inNumber, inString } from '../../base/Util';
import dayjs from 'dayjs';

// DOCS
// https://www.elastic.co/guide/en/elasticsearch/reference/8.5/query-dsl.html
// https://www.elastic.co/guide/en/elasticsearch/painless/8.5/painless-api-reference.html
export const SUFFIX_MATRIX: Record<MagicSuffix, Support> = {

    'Min': { string: false, number: true, date: true, boolean: true },
    'MinThan': { string: false, number: true, date: true, boolean: false },
    'Max': { string: false, number: true, date: true, boolean: true },
    'MaxThan': { string: false, number: true, date: true, boolean: false },

    'MinH': { string: false, number: false, date: true, boolean: false },
    'MinD': { string: false, number: false, date: true, boolean: false },
    'MinM': { string: false, number: false, date: true, boolean: false },
    'MaxH': { string: false, number: false, date: true, boolean: false },
    'MaxD': { string: false, number: false, date: true, boolean: false },
    'MaxM': { string: false, number: false, date: true, boolean: false },

    'Like': { string: true, number: false, date: false, boolean: false },
    'Likel': { string: true, number: false, date: false, boolean: false },
    'Liker': { string: true, number: false, date: false, boolean: false },

    'Bt': { string: false, number: true, date: true, boolean: false },
    'BtD': { string: false, number: false, date: true, boolean: false },
    'BtY': { string: false, number: false, date: true, boolean: false },
    'BtM': { string: false, number: false, date: true, boolean: false },

    'Not': { string: true, number: true, date: true, boolean: true },


    'In': { string: true, number: true, date: false, boolean: false },
    'NotIn': { string: true, number: true, date: false, boolean: false },

    'IsNull': { string: true, number: true, date: true, boolean: true },
    'NotNull': { string: true, number: true, date: true, boolean: true },

    // 'IsDistinct': { string: false, number: false, date: false, boolean: false },
    // 'NotDistinct': { string: false, number: false, date: false, boolean: false },

    '>': { string: false, number: true, date: true, boolean: true },
    '>=': { string: false, number: true, date: true, boolean: false },
    '<': { string: false, number: true, date: true, boolean: true },
    '<=': { string: false, number: true, date: true, boolean: false },
    '=': { string: true, number: true, date: true, boolean: true },
    '!=': { string: true, number: true, date: true, boolean: true },
    '<>': { string: true, number: true, date: true, boolean: true },

}

const isSupport = (item: WhereItem, err: string[]): boolean => {
    let suffix = SUFFIX_MATRIX[item.fn] || SUFFIX_MATRIX['='];
    if (suffix[item.type || 'string']) return true;
    err.push(`${item.column}/(${item.type}) not support method ${item.fn}`)
    return false;
}

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


const NullCondition = (item: WhereItem, query: QueryDslQueryContainer[], err: string[]): boolean => {
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
        query.push({ bool: { must_not: { exists: { field: item.column } } } as QueryDslBoolQuery })
    }
    return true;
}


const whereText = (item: WhereItem, query: QueryDslQueryContainer[], err: string[]) => {
    switch (item.fn) {
        case 'In':
            query.push({ terms: { [item.column]: inString(item.value + '') } });
            break;
        case 'NotIn':
            query.push({ bool: { must_not: { terms: { [item.column]: inString(item.value + '') } } } as QueryDslBoolQuery })
            break;
        case 'Not':
            query.push({ bool: { must_not: { term: { [item.column]: item.value + '' } } } as QueryDslBoolQuery })
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


const whereNumber = (item: WhereItem, query: QueryDslQueryContainer[], err: string[], parseFn) => {
    let compare = RANGE_MAP.get(item.fn);
    if (compare) {
        let value = parseFn(item.value as any);
        setRange(query, item.column, value, compare)
        return;
    }
    // if()
    if (item.fn == 'Bt') {
        let range = betweenNumber(item.value + '', parseFn);
        range.map(ptn => {
            let compare = RANGE_MAP.get(ptn[0]);
            if (compare) {
                setRange(query, item.column, ptn[1], compare)
            }
        })
        return;
    }
    switch (item.fn) {
        case 'In':
            query.push({ terms: { [item.column]: inNumber(item.value + '') } });
            break;
        case 'NotIn':
            query.push({ bool: { must_not: { terms: { [item.column]: inNumber(item.value + '') } } } as QueryDslBoolQuery })
            break;
        case '!=':
        case '<>':
            query.push({ bool: { must_not: { term: { [item.column]: item.value } } } as QueryDslBoolQuery })
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
        err.push(`${item.column}/(date) : Can not be null`)
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
            query.push({ bool: { must_not: { term: { [item.column]: val.toDate() } } } as QueryDslBoolQuery })
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
    if (!isSupport(item, err)) return;
    if (NullCondition(whereItem, query, err)) return;
    switch (item.type) {
        case 'number':
        case 'int':
            whereNumber(item, query, err, item.type == 'int' ? parseInt : parseFloat);
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


const buildWhere = (condition: WhereParam): QueryDslQueryContainer[] => {
    let root: WhereCondition = _.isArray(condition) ? { link: 'AND', items: condition } : condition;
    let query: QueryDslQueryContainer[] = [];
    let err: string[] = [];
    ConditionToWhere(root, query, err);
    throwErr(err, 'Some DSL Error Occur');
    return query;
}

export const fixWhere = (condition: WhereParam): QueryDslQueryContainer => {
    let query: QueryDslQueryContainer[] = buildWhere(condition)
    if (query.length == 0) {
        return null;
    }
    let bool = { filter: query } as QueryDslBoolQuery;
    return { constant_score: { filter: { bool } } }
}



export const where = (condition: WhereParam): QueryDslQueryContainer => {
    let query: QueryDslQueryContainer[] = buildWhere(condition)
    if (query.length == 0) {
        return null;
    }
    if (query.length == 1) {
        return { constant_score: { filter: query[0] } }
    }
    if (!_.isArray(condition) && condition.link == 'OR') {
        return { constant_score: { filter: { bool: { should: query, minimum_should_match: 1 } } } };
    }
    return { constant_score: { filter: { bool: { filter: query } as QueryDslBoolQuery } } }
}



/**
 * Global Filter Must postion on first Arg
*/
export const fixQuery = (fixFilter?: QueryDslQueryContainer, query?: QueryDslQueryContainer): QueryDslQueryContainer => {
    if (fixFilter == null && query == null) {
        return { match_all: {} }
    }
    if (fixFilter == null) {
        return query;
    }
    if (query == null) {
        return fixFilter;
    }

    if (!_.has(query, 'constant_score')) {
        return _.merge({}, fixFilter, query)
    }


    let searchParam: QueryDslQueryContainer = _.cloneDeep(fixFilter);

    _.keys(query.constant_score.filter).map(key => {
        if (key == 'bool') {
            _.keys(query.constant_score.filter.bool).map(boolKey => {
                if (boolKey == 'filter' || boolKey == 'must') {
                    if (_.isArray(query.constant_score.filter.bool[boolKey])) {
                        (query.constant_score.filter.bool[boolKey] as QueryDslQueryContainer[]).map(item => {
                            (searchParam.constant_score.filter.bool.filter as QueryDslQueryContainer[]).push(item)
                        });
                        // (searchParam.constant_score.filter.bool.filter as QueryDslQueryContainer[]).concat(query.constant_score.filter.bool[boolKey] as QueryDslQueryContainer[])
                    } else {
                        (searchParam.constant_score.filter.bool.filter as QueryDslQueryContainer[]).push(query.constant_score.filter.bool[boolKey] as QueryDslQueryContainer);
                    }
                } else {
                    searchParam.constant_score.filter.bool[boolKey] = query.constant_score.filter.bool[boolKey];
                }
            })


        } else {
            (searchParam.constant_score.filter.bool.filter as QueryDslQueryContainer[]).push({ [key]: query.constant_score.filter[key] })
        }
    })

    return searchParam;


}


export const buildSearch = (indexName: string, query: QueryDslQueryContainer, order: OrderByLimit, _source_excludes: Field[], globalFilter: QueryDslQueryContainer): SearchRequest => {
    const param: SearchRequest = {
        index: indexName,
        ...order,
    };
    if (_source_excludes && _source_excludes.length) {
        param._source_excludes = _source_excludes;
    }
    param.query = fixQuery(globalFilter, query)
    return param;
}