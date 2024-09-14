import type { DB_TYPE } from './types';

const PROVIDERS: Record<DB_TYPE, Function> = {
    pg: () => {
        // if (global.__oor_provider_pg) return global.__oor_provider_pg;
        throw new Error('Must specfy a Postgresql DataBase provider');
    },
    es: () => {
        // if (global.__oor_provider_es) return global.__oor_provider_es;
        throw new Error('Must specfy a ElasticSearch DataBase provider');
    },
    mysql: () => {
        // if (global.__oor_provider_mysql) return global.__oor_provider_mysql;
        throw new Error('Must specfy a Mysql DataBase provider');
    },
    sqlite: () => {
        // if (global.__oor_provider_sqlite) return global.__oor_provider_sqlite;
        throw new Error('Must specfy a Sqlite DataBase provider');
    },
}

export const setProvider = (type: DB_TYPE, fn: Function) => PROVIDERS[type] = fn;

export const getProvider = (type: DB_TYPE): Function => {
    if (typeof PROVIDERS[type] == 'function') return PROVIDERS[type];

    // if (global.process == undefined)
        return () => {
            throw new Error(`Must specfy a ${type} DataBase provider`);

        }
}