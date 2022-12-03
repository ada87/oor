import { SqlSelect, SqlCount, SqlById } from '../../base/sql';

export const select: SqlSelect = (table: string, fields: string = '*'): string => `SELECT ${fields || '*'} FROM ${table} `;

export const byId: SqlById = (id: string | number, key = 'id') => [`WHERE ${key} = $1`, [id]];

export const count: SqlCount = (table: string, field: string = '*') => `SELECT count(${field}) AS total FROM ${table}`;