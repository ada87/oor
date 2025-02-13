
/**
 * console.log(process.env['OOR_MODE'])
 * 
 * 注册方式分几种
 * 1. env : 使用环境变量，通常为 dbtype_portrites 如 PG_HOST
 * 2. mem : 使用内存
 * 3. global : 全局 globalThis
 * */ 


// globalThis['_OOR_PROVIDERS'] = {
//     // pg: () => {
//     //     // if (global.__oor_provider_pg) return global.__oor_provider_pg;
//     //     throw new Error('Must specfy a Postgresql DataBase provider');
//     // },
//     // es: () => {
//     //     // if (global.__oor_provider_es) return global.__oor_provider_es;
//     //     throw new Error('Must specfy a ElasticSearch DataBase provider');
//     // },
//     // mysql: () => {
//     //     // if (global.__oor_provider_mysql) return global.__oor_provider_mysql;
//     //     throw new Error('Must specfy a Mysql DataBase provider');
//     // },
//     // sqlite: () => {
//     //     // if (global.__oor_provider_sqlite) return global.__oor_provider_sqlite;
//     //     throw new Error('Must specfy a Sqlite DataBase provider');
//     // },
// } as Record<DB_TYPE, Function>

// export const setProvider = (type: DB_TYPE, fn: Function) => globalThis['_OOR_PROVIDERS'][type] = fn;

// export const getProvider = (type: DB_TYPE): Function => {
//     if (typeof globalThis['_OOR_PROVIDERS'][type] == 'function') return globalThis['_OOR_PROVIDERS'][type];

//     // if (global.process == undefined)
//     return () => {
//         throw new Error(`Must specfy a ${type} DataBase provider`);

//     }
// }