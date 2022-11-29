import type { ClientBase } from 'pg';
export declare const deleteById: (pg: ClientBase, table: string, id: string | number, key?: string) => Promise<number>;
