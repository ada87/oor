
import type { PoolConfig } from 'pg'
import type { PoolOptions } from 'mysql2'
import type { ClientOptions, ConnectionPoolOptions } from '@elastic/elasticsearch';
import type { DatabaseSyncOptions } from 'node:sqlite'

// PG
// MYSQL
// SQLITE_PATH
// ES

type ConfigMap = {
    pg: PoolConfig,
    mysql: PoolOptions,
    // sqlite: DatabaseSyncOptions,
    sqlite: string,
    es: ClientOptions
}


const PG_FIELDS = {
    NUMBER: ['max', 'min', 'idleTimeoutMillis', 'maxUses', 'maxLifetimeSeconds', 'port', 'statement_timeout',
        'query_timeout', 'keepAliveInitialDelayMillis', 'idle_in_transaction_session_timeout', 'connectionTimeoutMillis'],
    STRING: ['user', 'database', 'password', 'host', 'connectionString', 'application_name', 'options'],
    BOOLEAN: ['allowExitOnIdle', 'keepAlive'],
};

const MYSQL_FIELDS = {
    NUMBER: ['connectionLimit', 'waitForConnections', 'queueLimit', 'port'],
    STRING: ['host', 'user', 'password', 'database'],
    BOOLEAN: ['waitForConnections'],
}

const ES_FIELDS = {
    NUMBER: ['maxRetries', 'requestTimeout', 'pingTimeout', 'sniffOnStart', 'sniffOnConnectionFault', 'nodeSelector', 'maxResponseSize', 'generate'],
    STRING: ['node', 'auth', 'cloudId', 'username', 'password', 'apiVersion', 'ssl', 'agent', 'nodeSelector', 'generate'],
    BOOLEAN: ['sniffOnStart', 'sniffOnConnectionFault', 'generate'],
}

const getPG = (): PoolConfig => {
    const config: PoolConfig = {}
    PG_FIELDS.NUMBER.forEach(field => {
        const value = process.env[`PG_${field.toUpperCase()}`]
        if (value) {
            config[field] = parseInt(value)
        }
    })
    PG_FIELDS.STRING.forEach(field => {
        const value = process.env[`PG_${field.toUpperCase()}`]
        if (value) {
            config[field] = value
        }
    })
    PG_FIELDS.BOOLEAN.forEach(field => {
        const value = process.env[`PG_${field.toUpperCase()}`]
        if (value) {
            config[field] = value === 'true'
        }
    });

    return config;


}
