import Client from 'pg-native';

import { BaseDB } from './core/BaseDB';
import { PgTable } from './lib-pg/PgTable';
import { PgView } from './lib-pg/PgView'

// export { UType } from './core';

import type { TableOptions } from './core';
import type { TObject } from '@sinclair/typebox';
import type { ClientConfig } from 'pg'

export * from './core/types';

export class PgClient extends BaseDB<ClientConfig | (() => Client | Promise<Client>), Client> {
    private client: Client = null;

    override async getConn(): Promise<Client> {
        if (this.client == null) {
            if (typeof this.config == 'function') {
                this.client = await Promise.resolve(this.config.call(null));
            } else {
                this.client = new Client(this.config);
            }

            await this.client.connect()
        }
        return this.client;
    }



    Table<S extends TObject>(tbName: string, tbSchema: S, tbOptions?: TableOptions): PgTable<Client, S> {
        return new PgTable(this, tbName, tbSchema, tbOptions);
    }

    View<S extends TObject>(tableName: string, tbSchema: S, tbOptions?: TableOptions): PgView<Client, S> {
        return new PgView(this, tableName, tbSchema, tbOptions);
    }
}


export const PG = new PgClient(() => {
    let config: ClientConfig = {};

    try {
        config.host = process.env.PG_HOST;
        config.port = parseInt(process.env.PG_PORT);
        config.user = process.env.PG_USER;
        config.database = process.env.PG_DB;
        config.password = process.env.PG_PASS;
    } catch (error) {
        throw (error)
    }

    return new Client(config);
})


// pg @types/pg
// postgres
// mysql2
// @libsql/client
// better-sqlite3 @types/better-sqlite3