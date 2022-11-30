import type { QueryResult } from 'pg';
import { getDB } from './Util'

export abstract class BaseQuery {

    /**
     * Get Database connection form provider
    */
    protected db() {
        return getDB();
    }

    /**
     * Exec
    */
    sql(sql: string, params?: (string | number | boolean)[]): Promise<QueryResult> {
        return this.db().query(sql, params)
    }

}