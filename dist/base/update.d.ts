import type { ClientBase } from 'pg';
export declare const update: (pg: ClientBase, table: string, obj: any, key?: string) => Promise<number>;
