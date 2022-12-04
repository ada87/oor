import { SqlSelect, SqlCount, SqlByField } from '../../base/sql';

export const select: SqlSelect = (table: string, fields: string = '*'): string => `SELECT ${fields || '*'} FROM ${table} `;
// a fast funciton for where
export const byField: SqlByField = (field: string, id: string | number, startIdx: number = 1) => [` ${field} = $${startIdx} `, [id]];

export const count: SqlCount = (table: string, field: string = '*') => `SELECT count(${field}) AS total FROM ${table}`;