import { getDB } from './Util'
import type { SqlBuilder, BaseSqlExecutor } from './sql'

export abstract class BaseQuery {

    protected abstract _BUILDER: SqlBuilder;

    protected abstract _EXECUTOR: BaseSqlExecutor;

    /**
     * Get Database connection form provider
    */
    protected db() {
        return getDB();
    }

    /**
     * Exec A SQL Senctence
    */
    async sql(sql: string, params?: (string | number | boolean)[]): Promise<any> {
        return await this._EXECUTOR.query(getDB(), sql, params)
    }


}