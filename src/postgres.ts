// npm i postgres
import postgres from 'postgres'
import { BaseDB } from './core/BaseDB';
import { PgTable, PgView } from './lib-pg/PgTable';
// import { PgView } from './lib-pg/PgTable'

// export { UType } from './core/utils/SQLUtil';

import type { Options, Sql, PostgresType } from 'postgres';
import type { TableOptions } from './core';
import type { TObject } from '@sinclair/typebox';
// import type { PgSQL, ClientTypes } from './lib-pg/ExecutorPostgres';
export * from './core/types';



// export class PgPool<T extends ClientTypes> extends BaseDB<Options<T> | (() => PgSQL), PgSQL> {
//     private client: PgSQL = null;

//     override async getConn(): Promise<PgSQL> {
//         if (this.client == null) {
//             if (typeof this.config == 'function') {
//                 this.client = this.config();
//             } else {
//                 this.client = postgres(this.config);
//             }

//             // await this.pool.connect()
//         }
//         return this.client
//         // return this.pool;
//     }



//     Table<S extends TObject>(tbName: string, tbSchema: S, tbOptions?: TableOptions): PgTable<PgSQL, S> {
//         return new PgTable(this, tbName, tbSchema, tbOptions);
//     }

//     View<S extends TObject>(tableName: string, tbSchema: S, tbOptions?: TableOptions): PgView<PgSQL, S> {
//         return new PgView(this, tableName, tbSchema, tbOptions);
//     }
// }


// // export const PG = new PgPool(() => {
// //     let config: PoolConfig = {};

// //     try {
// //         config.host = process.env.PG_HOST;
// //         config.port = parseInt(process.env.PG_PORT);
// //         config.user = process.env.PG_USER;
// //         config.database = process.env.PG_DB;
// //         config.password = process.env.PG_PASS;
// //     } catch (error) {
// //         throw (error)
// //     }

// //     return new Pool(config);
// // })

