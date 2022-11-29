import type { ClientBase } from 'pg';
export declare const selectById: (pg: ClientBase, table: string, id: string | number, fields?: string[], key?: string) => Promise<any>;
export declare const selectAll: (pg: ClientBase, table: string, fields?: string) => Promise<any[]>;
