import { openDB } from 'idb';
import type { DBSchema, DBVersion, IDBPDatabase, IDBPObjectStore } from './type'


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

export const getDB = async <T extends DBSchema>(dbName: string, versions: DBVersion[]): Promise<IDBPDatabase<T>> => {
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

