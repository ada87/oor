import { existsSync, readFileSync, rmSync } from 'fs'
import { isAbsolute, resolve, } from 'path';
import { DatabaseSync, } from 'node:sqlite';
import { bgYellow, colorGreen, colorMagenta, colorRed } from '../utils/color'

export const initFromSQL = (targetDBPath: string, sql: string) => {
    const dbFile = isAbsolute(targetDBPath) ? targetDBPath : resolve(process.cwd(), targetDBPath);
    if (existsSync(dbFile)) throw new Error(`DateBase File ${colorMagenta(dbFile)} already exists`);
    const db = new DatabaseSync(dbFile);
    try {
        console.log(colorGreen(sql))
        db.exec(sql);
    } catch (err) {
        console.error('❌ ' + bgYellow(colorRed(' DateBase init error ')));
        console.log(err)
        db.close();
        if (existsSync(dbFile)) rmSync(dbFile);
        throw err
    }
    console.log('✅ DateBase inited ')
}
export const initFromFile = (targetDBPath: string, sqlFile: string) => {
    const dbFile = isAbsolute(targetDBPath) ? targetDBPath : resolve(process.cwd(), targetDBPath);
    if (existsSync(dbFile)) throw new Error(`DateBase File ${colorMagenta(dbFile)} already exists`);
    const sqlContent = existsSync(sqlFile) ? readFileSync(sqlFile, 'utf-8') : '';
    initFromSQL(dbFile, sqlContent);
}