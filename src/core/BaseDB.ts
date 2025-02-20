import type { DatabaseOptions, Database } from './types';

const DEFAULT_OPTIONS: DatabaseOptions = { pageSize: 20, rowKey: 'id', }

export abstract class BaseDB<ConnectionConfig, C, Options extends DatabaseOptions = DatabaseOptions> implements Database<C, Options> {

    protected config: ConnectionConfig;
    protected options: Options;

    constructor(config: ConnectionConfig, options?: Options) {
        this.config = config;
        this.options = { ...DEFAULT_OPTIONS, options } as any;
    }

    public getOption(): Options {
        return { ...this.options }
    }

    public abstract getConn(): Promise<C>;

}


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
