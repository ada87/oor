import { existsSync, readdirSync, readFileSync, rmSync } from 'fs'
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


const initDB = (targetDBPath: string): DatabaseSync => {
    const dbFile = isAbsolute(targetDBPath) ? targetDBPath : resolve(process.cwd(), targetDBPath);
    if (existsSync(dbFile)) return new DatabaseSync(dbFile);
    const db = new DatabaseSync(dbFile);;
    db.exec(`CREATE TABLE IF NOT EXISTS migration_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    return db;

}

export const autoInit = (targetDBPath: string, sqlDir: string) => {
    if (!existsSync(sqlDir)) {
        throw (`Directory ${colorMagenta(sqlDir)} not exists`)
    }
    let sqlFiles = readdirSync(sqlDir).filter(file => file.endsWith('.sql')).sort();
    if (sqlFiles.length == 0) {
        throw (`Directory ${colorMagenta(sqlDir)} is empty`)
    }
    const db = initDB(targetDBPath);
    // const 




    // try {
    // db.exec(`
    //     CREATE TABLE IF NOT EXISTS migration_history (
    //         id INTEGER PRIMARY KEY AUTOINCREMENT,
    //         filename TEXT NOT NULL,
    //         executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //     );
    // `);

    // const files = readdirSync(sqlDir).filter(file => file.endsWith('.sql')).sort();
    // for (const file of files) {
    //     const sqlContent = readFileSync(resolve(sqlDir, file), 'utf-8');
    //     const alreadyExecuted = db.prepare('SELECT COUNT(*) AS count FROM migration_history WHERE filename = ?').get(file).count > 0;
    //     if (!alreadyExecuted) {
    //         db.exec(sqlContent);
    //         db.prepare('INSERT INTO migration_history (filename) VALUES (?)').run(file);
    //         console.log(`✅ Executed ${file}`);
    //     } else {
    //         console.log(`⚠️ Skipped ${file}, already executed`);
    //     }
    // }
    // } catch (err) {
    //     console.error('❌ ' + bgYellow(colorRed(' DateBase init error ')));
    //     console.log(err);
    //     db.close();
    //     if (existsSync(dbFile)) rmSync(dbFile);
    //     throw err;
    // }
    console.log('✅ DateBase inited ');
}