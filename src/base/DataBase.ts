// type IS_POOL = boolean;

type DateType = Date | string | number | null | undefined;



type DataBaseOptions = {
    isPool?: false
    logger?: boolean
    pageSize?: number
    dateType?: DateType
    strict?: boolean | {

        query?: boolean
        entity?: boolean,
    },
}

// type TableOptions = 
// | {
//     isPool: true
//     logger?: boolean
// }




const DEFAULT_OPTIONS: DataBaseOptions = {
    isPool: false,
    logger: false,
    pageSize: 20,
}

export abstract class Database<Conn> {
    abstract getConn(): Promise<Conn>;
}



export abstract class BaseClient<ConnectionConfig, Conn, Options extends DataBaseOptions = DataBaseOptions> extends Database<Conn> {

    protected config: ConnectionConfig;
    protected options = { ...DEFAULT_OPTIONS } as Options;

    constructor(config: ConnectionConfig, options?: Options) {
        super();
        this.config = config;
        this.options = { ...DEFAULT_OPTIONS, options } as any;
    }

    isPool(): boolean {
        return this.options.isPool;
    }
    logger() {
        if (this.options.logger) {

        }
    }


}



// export abstract class BasePool<ConnectionConfig, Conn, Options extends ClientOptions = ClientOptions> extends Database<Conn> {

//     protected config: ConnectionConfig;
//     protected options = { ...DEFAULT_OPTIONS } as Options;

//     constructor(config: ConnectionConfig, options?: Options) {
//         super();
//         this.config = config;
//         this.options = { ...DEFAULT_OPTIONS, options } as any;
//     }

//     abstract release(conn: Conn): void;

// }
