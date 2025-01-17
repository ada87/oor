import { existsSync, readFileSync, writeFileSync, rmSync, copyFileSync } from 'fs';
import { exec } from 'child_process';
import { resolve, sep } from 'path';
import _ from 'lodash';
const __dirname = process.cwd();


const RunBuild = () => {
    const distDir = resolve(__dirname, './dist')
    if (existsSync(distDir)) rmSync(distDir, { recursive: true });
    exec('tsc', () => {
        for (let file of ['README.md', 'README_ZH.md']) {
            copyFileSync(resolve(__dirname, file), distDir + sep + file)
        }
        let json = JSON.parse(readFileSync(resolve(__dirname, 'package.json')).toString('utf8'));
        _.unset(json, 'devDependencies')
        _.unset(json, 'scripts');
        _.unset(json, 'files');
        writeFileSync(distDir + sep + 'package.json', JSON.stringify(json))
    });


}
RunBuild();
