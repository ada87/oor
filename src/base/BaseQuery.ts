import type { Database } from './DataBase';
import type { SqlBuilder, BaseSqlExecutor } from './sql';
import type { Static, TObject } from '@sinclair/typebox';

/**
 * Basic Query, abstract class, must implement these properties:
*/
export abstract class BaseQuery<T extends TObject, Connection> {

    private db: Database<Connection>;

    constructor(db: Database<Connection>) {
        this.db = db;
    }

    /** 
     * _BUILDER: SqlBuilder  - SQL Query Builder for db
    *   @see SqlBuilder
    */
    protected abstract _BUILDER: SqlBuilder;

    /** 
    * _EXECUTOR: BaseSqlExecutor  - SQL Executer for db
    *      @see BaseSqlExecutor
    */
    protected abstract _EXECUTOR: BaseSqlExecutor<Static<T>>;

    /**
     * Get Database connection form provider
    */
    async getConn(): Promise<Connection> {
        return this.db.getConn();
    }

}