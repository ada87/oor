import type { ClientBase } from 'pg';
export declare const insert: (pg: ClientBase, table: string, obj: any) => Promise<any>;
