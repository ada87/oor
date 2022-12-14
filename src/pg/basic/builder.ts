import type { SqlDelete, SqlInsert, SqlOrderBy, SqlUpdate, SqlLimit, SqlSelect, SqlCount, SqlByField } from '../../base/sql';
import type { QuerySchema } from '../../base/types';

import _ from 'lodash';
import { PAGE_SIZE } from '../../base/Util';

export const select: SqlSelect = (table: string, fields: string = '*'): string => `SELECT ${fields || '*'} FROM ${table} `;

export const count: SqlCount = (table: string) => `SELECT count(0) AS total FROM ${table}`;

export const insert: SqlInsert = (table: string, obj: any): [string, any[]] => {
    const fields = _.keys(obj);
    if (fields.length == 0) {
        throw new Error();
    }
    let query = [];
    let idx = [];
    let param = [];

    fields.map((field, i) => {
        let val = obj[field];
        if (val === null) {
            return
        }
        query.push(field)
        idx.push("$" + (i + 1));
        param.push(val)
    })
    return [`INSERT INTO ${table} (${query.join(',')}) VALUES (${idx.join(',')}) RETURNING *`, param];
}

export const update: SqlUpdate = (table: string, obj: any, key = 'id'): [string, any[]] => {
    const fields = _.keys(obj);
    if (fields.length == 0) throw new Error();
    let query = [];
    let param = [];

    let diff = 1;
    fields.map((field, i) => {
        // Not Allow Update Primary Key
        if (field == key) {
            diff = 0;
            return;
        }
        let val = obj[field];
        query.push(`${field} = $${i + diff}`)
        param.push(val)
    });

    return [`UPDATE  ${table} SET ${query.join(',')}`, param];
}

export const del: SqlDelete = (table: string): string => `DELETE FROM ${table} `

const BY_SET = new Set<string>(['asc', 'desc']);

export const orderBy: SqlOrderBy = (fieldSet: Map<string, any>, query?: QuerySchema, default_order = 'id', default_by = 'desc') => {
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

export const limit: SqlLimit = (query?: QuerySchema, pageSize: number = PAGE_SIZE) => {
    let start = _.has(query, 'start_') ? query.start_ : 0;
    let count = _.has(query, 'count_') ? query.count_ : pageSize;
    return `LIMIT ${count} OFFSET ${start}`
}

export const byField: SqlByField = (field: string, id: string | number, startIdx: number = 1) => [` ${field} = $${startIdx} `, [id]];
