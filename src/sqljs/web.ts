import _ from 'lodash';
import initSqlJs from 'sql.js';
import { Settings, setup as _setup } from '../base/Util'
export { View, Table } from './core';

import type { Database } from 'sql.js';

export { UType } from '../base/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
export type { Static } from '@sinclair/typebox';

import { setSaveFunction } from './basic/save';
import type { SaveFunction } from './basic/save';


// export const SAVE_TO_LOCATION: SaveFunction = async () => {
//     return true
// }

export type SqliteSettings = Omit<Settings, 'provider'> & {
    provider: {
        wasm: string,
        db: string,
        onSave?: SaveFunction
    }
};
export const setup = async (settings: SqliteSettings): Promise<Database> => {
    let db: Database;
    const SQL = await initSqlJs({ locateFile: file => settings.provider.wasm });
    const resp = await fetch("/path/to/database.sqlite");
    const buf = await resp.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buf));
    if (_.isFunction(settings.provider.onSave)) {
        setSaveFunction(settings.provider.onSave);
    }
    _setup({ ...settings, provider: ['sqlite', () => db], })
    return db;
}