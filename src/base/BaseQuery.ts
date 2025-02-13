import type { Database } from './DataBase';
import type { SqlBuilder, BaseSqlExecutor } from './sql';

/**
 * Basic Query, abstract class, must implement these properties:
*/
export abstract class BaseQuery<Connection> {

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
    protected abstract _EXECUTOR: BaseSqlExecutor;

    /**
     * Get Database connection form provider
    */
    async getConn(): Promise<Connection> {
        return this.db.getConn();
    }

}