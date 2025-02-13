type BaseOptions = {
    pool?: boolean
    logger?: boolean;
}


const DEFAULT_OPTIONS: BaseOptions = {
    pool: false,
    logger: false,
}

export abstract class Database<Conn> {
    abstract getConn(): Promise<Conn>;
}

export abstract class BaseClient<ConnectionConfig, Conn, Options extends BaseOptions = BaseOptions> extends Database<Conn> {

    protected config: ConnectionConfig;
    protected options = { ...DEFAULT_OPTIONS } as Options;

    constructor(config: ConnectionConfig, options?: Options) {
        super();
        this.config = config;
        this.options = { ...DEFAULT_OPTIONS, options } as any;
    }

    abstract getConn(): Promise<Conn>;


}
