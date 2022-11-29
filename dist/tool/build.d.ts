import { Client } from 'pg';
export declare const build: (pg: Client, schema: string, table: string | string[]) => Promise<void>;
