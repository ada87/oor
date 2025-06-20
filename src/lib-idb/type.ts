
import type { IDBPDatabase } from 'idb';
export type { IDBPDatabase, IDBPObjectStore, DBSchema } from 'idb';
export type DBVersion = (db: IDBPDatabase) => Promise<void>;

type UpgradeScript = (db: IDBPDatabase) => Promise<void>;
