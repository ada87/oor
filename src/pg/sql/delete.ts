import type { SqlDelete } from '../../base/sql';
export const del: SqlDelete = (table: string): string => `DELETE FROM ${table} `