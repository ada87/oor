import { BaseClient } from '../base/DataBase';
import { PgTable } from './PgTable';
import { PgView } from './PgView'



import type { TableOptions } from '../base/BaseView';
import type { TObject } from '@sinclair/typebox';


// export { UType } from '../base/Provider/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
export type { Static } from '@sinclair/typebox';
import { Client, Pool } from 'pg'
import { ClientConfig, PoolConfig, PoolClient } from 'pg';

export class Pg extends BaseClient<(ClientConfig | (() => Client)), Client> {
    private client: Client = null;

    async getConn(): Promise<Client> {
        if (this.client != null) return this.client;
        if (typeof this.config == 'function') {
            this.client = await Promise.resolve(this.config.call(null));
            await this.client.connect()
            return this.client
        }
        this.client = new Client(this.client);
        await this.client.connect()
        return this.client;

    }



    Table<T extends TObject>(tableName: string, schema: T, options: TableOptions): PgTable<T> {
        return new PgTable(this, tableName, schema, options);
    }

    View<T extends TObject>(tableName: string, schema: T, options: TableOptions): PgView<T> {
        return new PgView(this, tableName, schema, options);
    }

}

export class PgPool extends BaseClient<PoolConfig, Pool> {
    private pool: Pool = null;

    async getConn(): Promise<Pool> {
        if (this.pool == null) {
            this.pool = new Pool(this.config);
            await this.pool.connect()
        }
        return this.pool;
    }



    Table<T extends TObject>(tableName: string, schema: T, options: TableOptions): PgTable<T> {
        return new PgTable(this, tableName, schema, options);
    }

    View<T extends TObject>(tableName: string, schema: T, options: TableOptions): PgView<T> {
        return new PgView(this, tableName, schema, options);
    }
}


export const PG = new Pg(()=>{
    return new Pool({}) as any;
})


// pg @types/pg
// postgres
// mysql2
// @libsql/client
// better-sqlite3 @types/better-sqlite3