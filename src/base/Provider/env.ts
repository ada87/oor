import type { DB_TYPE } from "../types";

import type { PoolOptions as PgOptions } from 'pg'
import type { PoolOptions as MySqlOptions } from 'mysql2'
import type { ClientOptions, ConnectionPoolOptions } from '@elastic/elasticsearch';
import type { DatabaseSyncOptions } from 'node:sqlite'

export const getEnv = (dbType: DB_TYPE) => {

}