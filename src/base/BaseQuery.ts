import { getProvider } from './Provider/Providers';

import type { SqlBuilder, BaseSqlExecutor } from './sql';
import type { DB_TYPE } from './types';

/**
 * Basic Query, abstract class, must implement these properties:
*/
export abstract class BaseQuery<Conn> {

    /**
     * _DB_TYPE: string - speific a database type, 
     *  support for now : 'mysql', 'pg', 'es', 'sqlite'
    */
    protected abstract _DB_TYPE: DB_TYPE;

    /** 
     * _BUILDER: SqlBuilder  - SQL Query Builder for db
    *   @see SqlBuilder
    */
    protected abstract _BUILDER: SqlBuilder;

    /** 
    * _EXECUTOR: BaseSqlExecutor  - SQL Executer for db
    *      @see BaseSqlExecutor
    */
    protected abstract _EXECUTOR: BaseSqlExecutor;

    /**
     * Get Database connection form provider
    */
    async getClient(): Promise<Conn> {
        return getProvider(this._DB_TYPE)();
    }

    /**
     * Exec A Senctence
    */
    // sql(...args: any[]): Promise<any> {
    //     return this._EXECUTOR.query.call(this, this.getClient(), ...args)
    // }


}