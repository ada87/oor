import type { SqlBuilder, BaseSqlExecutor } from './sql';
import type { DB_TYPE } from './types';
import { PROVIDERS } from './Providers';

export abstract class BaseQuery {

    protected abstract _DB_TYPE: DB_TYPE;

    protected abstract _BUILDER: SqlBuilder;

    protected abstract _EXECUTOR: BaseSqlExecutor;

    /**
     * Get Database connection form provider
    */
    protected db() {
        return PROVIDERS[this._DB_TYPE]();
    }

    /**
     * Exec A SQL Senctence
    */
    sql(sql: string, params?: (string | number | boolean)[]): Promise<any> {
        return this._EXECUTOR.query(PROVIDERS[this._DB_TYPE](), sql, params)
    }


}