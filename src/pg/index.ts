import { Client, Pool } from 'pg'
import { BaseClient } from '../base/DataBase';
import { PgTable } from './PgTable';
import { PgView } from './PgView'

export { UType } from '../base/Util';
import type { ClientConfig, PoolConfig } from 'pg';
import type { TableOptions } from '../base/BaseView';
import type { Static, TObject } from '@sinclair/typebox';

// export { UType } from '../base/Provider/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';


// export class Pg extends BaseClient<(ClientConfig | (() => Client)), Client> {
//     private client: Client = null;

//     async getConn(): Promise<Client> {
//         if (this.client != null) return this.client;
//         if (typeof this.config == 'function') {
//             this.client = await Promise.resolve(this.config.call(null));
//             await this.client.connect()
//             return this.client
//         }
//         this.client = new Client(this.client);
//         await this.client.connect()
//         return this.client;

//     }



//     Table<T extends TObject>(tableName: string, schema: T, options?: TableOptions): PgTable<T> {
//         return new PgTable(this, tableName, schema, options);
//     }

//     View<T extends TObject>(tableName: string, schema: T, options?: TableOptions): PgView<T> {
//         return new PgView(this, tableName, schema, options);
//     }

// }

export class PgPool extends BaseClient<PoolConfig | (() => Pool), Pool> {
    private pool: Pool = null;

    async getConn(): Promise<Pool> {

        if (this.pool == null) {
            if (typeof this.config == 'function') {
                this.pool = await Promise.resolve(this.config.call(null));
            } else {
                this.pool = new Pool(this.config);
            }

            await this.pool.connect()
        }
        return this.pool;
    }



    Table<T extends TObject>(tableName: string, schema: T, options?: TableOptions): PgTable<T> {
        return new PgTable(this, tableName, schema, options);
    }

    View<T extends TObject>(tableName: string, schema: T, options?: TableOptions): PgView<T> {
        return new PgView(this, tableName, schema, options);
    }
}


export const PG = new PgPool(() => {
    let config: PoolConfig = {};

    try {
        config.host = process.env.PG_HOST;
        config.port = parseInt(process.env.PG_PORT);
        config.user = process.env.PG_USER;
        config.database = process.env.PG_DB;
        config.password = process.env.PG_PASS;
    } catch (error) {
        throw (error)
    }
    
    // console.log(config)
    // console.log(config)
    return new Pool(config) ;
})


// pg @types/pg
// postgres
// mysql2
// @libsql/client
// better-sqlite3 @types/better-sqlite3