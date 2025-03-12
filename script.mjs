import _ from 'lodash';
import { existsSync, readdirSync, readFileSync, writeFileSync, rmSync, copyFileSync, } from 'fs';
import { exec } from 'child_process';
import { resolve, join, sep } from 'path';
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


const buildExport = () => {
    const exports = {}
    const walk = (currentDir, relativePath = "/") => {
        const files = readdirSync(currentDir, { withFileTypes: true });
        files.forEach((file) => {
            if (file.isDirectory()) {
                walk(join(currentDir, file.name), relativePath + file.name + '/');
            } else if (file.isFile() && file.name.endsWith('.d.ts')) {
                const fileName = file.name.substring(0, file.name.length - 5);
                const path = (relativePath + fileName);
                exports['.' + path] = {
                    import: {
                        types: './esm' + path + '.d.ts',
                        default: './esm' + path + '.js'
                    },
                    require: {
                        types: './cjs' + path + '.d.ts',
                        default: './cjs' + path + '.js'
                    },
                }
            }
        });
    }
    walk(resolve(distDir, './esm'));
    return exports;
}
// tsc --project tsconfig-cjs.json --outDir ../fda/node_modules/oor
// tsc --project tsconfig-esm.json --outDir ../fda/node_modules/oor
const RunBuild = async () => {
    if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });

    await runCommand('tsc --project tsconfig-cjs.json');
    await runCommand('tsc --project tsconfig-esm.json');

    for (let file of ['README.md', 'README_ZH.md']) {
        copyFileSync(resolve(__dirname, file), distDir + sep + file)
    }
    let json = JSON.parse(readFileSync(resolve(__dirname, 'package.json')).toString('utf8'));
    _.unset(json, 'devDependencies')
    _.unset(json, 'scripts');
    _.unset(json, 'files');
    _.unset(json, 'pnpm')
    json.exports = buildExport();
    writeFileSync(distDir + sep + 'package.json', JSON.stringify(json, null, 2), 'utf-8')

    console.log("✅ Build OK");
}

RunBuild();