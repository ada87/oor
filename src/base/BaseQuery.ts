import type { Database } from './DataBase';

/**
 * Basic Query, abstract class, must implement these properties:
*/
export abstract class BaseQuery<C> {

    private db: Database<C>;

    constructor(db: Database<C>) {
        this.db = db;
    }



    getDB(): Database<C> {
        return this.db;
    }
    /**
     * Get Database connection form provider
    */
    async getConn(): Promise<C> {
        return this.db.getConn();
    }

}