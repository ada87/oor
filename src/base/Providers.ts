import type { DB_TYPE } from './types';


export const PROVIDERS: Record<DB_TYPE, Function> = {
    pg: () => {
        throw new Error('Must specfy a Postgresql DataBase provider');
    },
    es: () => {
        throw new Error('Must specfy a ElasticSearch DataBase provider');
    },
    mysql: () => {
        throw new Error('Must specfy a Mysql DataBase provider');
    },
    sqlite: () => {
        throw new Error('Must specfy a Sqlite DataBase provider');
    },
}

export const setProvider = (type: DB_TYPE, fn: Function) => PROVIDERS[type] = fn;
