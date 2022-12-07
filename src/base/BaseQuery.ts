import type { SqlBuilder, BaseSqlExecutor } from './sql';
import type { DB_TYPE } from './types';
import { PROVIDERS } from './Providers';

export abstract class BaseQuery<Conn> {

    protected abstract _DB_TYPE: DB_TYPE;

    protected abstract _BUILDER: SqlBuilder;

    protected abstract _EXECUTOR: BaseSqlExecutor;

    /**
     * Get Database connection form provider
    */
    getClient(): Conn {
        return PROVIDERS[this._DB_TYPE]();
    }

    /**
     * Exec A Senctence
    */
    sql(...args: any[]): Promise<any> {
        return this._EXECUTOR.query.call(this, this.getClient(), ...args)
    }


}