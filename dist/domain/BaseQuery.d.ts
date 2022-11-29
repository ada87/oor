import type { QueryResult } from 'pg';
export declare abstract class BaseQuery {
    /**
     * Get Database connection form provider
    */
    protected db(): import("pg").ClientBase;
    /**
     * Exec
    */
    sql(sql: string, params?: (string | number | boolean)[]): Promise<QueryResult>;
}
