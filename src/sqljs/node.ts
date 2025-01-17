import _ from 'lodash';
import initSqlJs from 'sql.js/dist/sql-wasm';
import { readFileSync } from 'fs'
import { Settings, setup as _setup } from '../base/Util'
import { SaveFunction, setSaveFunction } from './basic/save';
import type { Database } from 'sql.js';



export { UType } from '../base/Util';
export { View, Table } from './core';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
export type { Static } from '@sinclair/typebox';

export type SqliteSettings = Omit<Settings, 'provider'> & {
    provider: {
        wasm: string,
        db: string,
    }
};

import { writeFileSync } from 'fs';

export const setup = async (settings: SqliteSettings): Promise<Database> => {
    // let db: Database;
    const dbPath = settings.provider.db;
    const save: SaveFunction = async (data) => {
        writeFileSync(dbPath, data);
        return true;
    }
    setSaveFunction(save);
    const SQL = await initSqlJs({
        wasmBinary: readFileSync(settings.provider.wasm) as any
    });;
    _setup({
        ...settings,
        provider: ['sqlite', () => {
            const buffer = readFileSync(settings.provider.db);
            return new SQL.Database(buffer)
        }],
    })
    const buffer = readFileSync(settings.provider.db);
    return new SQL.Database(buffer);
}