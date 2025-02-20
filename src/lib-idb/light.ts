import { openDB } from 'idb';

import type { IDBPDatabase, IDBPObjectStore, DBSchema } from 'idb';

export type DBVersion = (db: IDBPDatabase) => Promise<void>;


export const getObjectStore = (db: IDBPDatabase, storeName: string, mode: IDBTransactionMode = 'readonly'): IDBPObjectStore => {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName) as IDBPObjectStore;
}

export const removeAllDB = async () => {
    const dbs = await indexedDB.databases()
    for (let db of dbs) {
        await indexedDB.deleteDatabase(db.name);
    }
}

export const getDB = async <T extends DBSchema | unknown = unknown>(dbName: string, versions: DBVersion[]): Promise<IDBPDatabase<T>> => {
    const LAST_VERSION = versions.length;

    const db = await openDB<T>(dbName, LAST_VERSION, {
        upgrade: async (db, oldVersion, newVersion) => {
            console.log(`${dbName} : 检测到新版本，将自动升级，当前版本 ${oldVersion}, 最新版本 : ${newVersion}`)
            const lastVersion = Math.min(newVersion, LAST_VERSION);
            for (let upgradeVersion = oldVersion; upgradeVersion < lastVersion; upgradeVersion++) {
                console.log(`${dbName} : 版本升级 从 ${upgradeVersion} 升级到 ${upgradeVersion + 1}`)
                await versions[upgradeVersion](db as IDBPDatabase);
            }
            console.log(`${dbName} : 已经升级到 ${lastVersion}`)
        }
    });
    return db;
}


type UpgradeScript = (db: IDBPDatabase) => Promise<void>;

export const VERSIONS: DBVersion[] = [

    // 版本 1
    async (db: IDBPDatabase) => {
        // 注册表
        // const addon = db.createObjectStore(ADDON, { keyPath: 'ik', autoIncrement: false });
        // addon.createIndex('type', 'type');

        // // 插件配置表，支持单域配置与多域配置
        // // 单域配置：全站一致，多域配置，针对每个域名单独配置
        // const config = db.createObjectStore(CONFIG, { keyPath: 'id', autoIncrement: true });
        // config.createIndex('addon', 'addon');
        // config.createIndex('addon_key', ['addon', 'key']);

        // // 站点激活与停用
        // const siteEnable = db.createObjectStore(SITE_ENABLE, { keyPath: 'id', autoIncrement: true });
        // siteEnable.createIndex('site', 'site');
        // siteEnable.createIndex('addon_site', ['addon', 'site'], { unique: true });

        // // 站点配置表
        // const siteConfig = db.createObjectStore(SITE_CONFIG, { keyPath: 'id', autoIncrement: true });
        // siteConfig.createIndex('addon_site', ['addon', 'site']);    // 获取一个 站点&Addon 的所有配置
        // siteConfig.createIndex('site', 'site');

    },

];