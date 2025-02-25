import { existsSync, readFileSync, writeFileSync, rmSync, copyFileSync, renameSync } from 'fs';
import { fsWalker } from 'xda/utils/fs.js'
import { exec } from 'child_process';
import { resolve, sep } from 'path';
import _ from 'lodash';
const __dirname = process.cwd();
const distDir = resolve(__dirname, './dist')

const runCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stdout);
        });
    });
}

const RunBuild = async () => {
    if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });

    await runCommand('tsc --project tsconfig-cjs.json');
    await fsWalker(distDir, (file, info) => {
        if (info.isFile() && file.endsWith('.js')) {
            console.log(file);
            renameSync(file, file.substring(0, file.length - 2) + 'cjs')
        }
    })
    await runCommand('tsc --project tsconfig-esm.json');

    for (let file of ['README.md', 'README_ZH.md']) {
        copyFileSync(resolve(__dirname, file), distDir + sep + file)
    }
    let json = JSON.parse(readFileSync(resolve(__dirname, 'package.json')).toString('utf8'));
    _.unset(json, 'devDependencies')
    _.unset(json, 'scripts');
    _.unset(json, 'files');
    writeFileSync(distDir + sep + 'package.json', JSON.stringify(json))
}
RunBuild();
