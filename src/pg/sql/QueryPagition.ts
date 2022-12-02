import _ from 'lodash';
import type { QuerySchema } from '../../base/types';
import { PAGE_SIZE } from '../../base/Util';

const BY_SET = new Set<string>(['asc', 'desc']);


const orderBy = (fieldSet: Map<string, any>, query?: QuerySchema, default_order = 'id', default_by = 'desc') => {
    if (!_.has(query, 'order_')) {
        if (fieldSet.has(default_order)) {
            return `ORDER BY ${default_order} ${default_by}`
        }
        return '';
    }
    if (fieldSet.has(query.order_)) {
        let by = query.by_ || default_by;
        if (_.has(query, 'by_') && BY_SET.has(query.by_)) {
            by = query.by_;
        } else {
            by = default_by;
        }
        return `ORDER BY ${query.order_} ${by}`
    }
    return '';

}


const limit = (query?: QuerySchema, pageSize: number = PAGE_SIZE) => {
    let start = _.has(query, 'start_') ? query.start_ : 0;
    let count = _.has(query, 'count_') ? query.count_ : pageSize;
    return `LIMIT ${count} OFFSET ${start}`
}


export const orderByLimit = (fieldSet: Map<string, any>, query?: QuerySchema, pageSize: number = PAGE_SIZE, default_order = 'id', default_by = 'desc'): [string, string] => [
    orderBy(fieldSet, query, default_order, default_by), limit(query, pageSize)
]