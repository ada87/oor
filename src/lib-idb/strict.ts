import { openDB } from 'idb';
import { UType } from '../utils/types';
import { Type } from '@sinclair/typebox';

import type {
    SchemaOptions, TProperties, TPartial,
    TObject, StringOptions, DateOptions, NumberOptions,
} from '@sinclair/typebox';

// const UpgradeCreateObjectStore = UType.Table(null)
const UpgradeCreateTable = UType.Table(null)
const UpgradeCreateIndex = UType.Table(null)

// const UpgradeRemoveObjectStore = UType.Table(null)
const UpgradeRemoveTable = UType.Table(null)
const UpgradeRemoveIndex = UType.Table(null)

const UpgradeInsertRecord = UType.Table(null)
const UpgradeRemoveRecord = UType.Table(null)
const UpgradeClearTable = UType.Table(null);

// const UpgradeCreateIndexObjectStore = UType.Table(null)
// const UpgradeAddField = UType.Table(null)
// const UpgradeAddIndex = UType.Table(null)
// const UpgradeInsertRecords = UType.Table(null)


type Upgrade = {

}

// export const UType = {
//     Table: <T extends TProperties>(properties: T): TPartial<TObject<T>> => Type.Partial(Type.Object(properties)),
//     Number: (options?: UNumericOptions) => Type.Number(options),
//     String: (options?: UStringOptions) => Type.String(options),
//     Date: (options?: UDateOptions) => Type.Union([Type.Date(options), Type.Number(), Type.String()], options),
//     Boolean: (options?: Column) => Type.Boolean(options),
//     Integer: (options?: UNumericOptions) => Type.Integer(options),
// }

// 版本 1
// async (db: IDBPDatabase) => {
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

// },


import type { IDBPDatabase, IDBPObjectStore, DBSchema } from 'idb';

export type DBVersion = (db: IDBPDatabase) => Promise<void>;

type UpgradeScript = (db: IDBPDatabase) => Promise<void>;


const u = (db:IDBPDatabase)=>{
    // db.clear('table')
    // db.
}