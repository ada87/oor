import { assert } from '@japa/assert'
import { configure, run } from '@japa/runner'
import { specReporter } from '@japa/spec-reporter'
import { existsSync, readFileSync, writeFileSync, rmSync, copyFileSync } from 'fs';
import { exec } from 'child_process';
import { resolve, sep } from 'path';
import _ from 'lodash';

let isPub = (process.argv[process.argv.length - 1] == '--build');

const RunTest = () => {
  // Load Env
  if (existsSync('.env')) {
    let lines = readFileSync('.env', 'utf-8').split(/\r?\n/);
    lines.map(line => {
      let ptn = line.split('=');
      if (ptn.length = 2) {
        process.env[_.trim(ptn[0])] = _.trim(ptn[1]);
      }
    })
  }

  configure({
    files: ['src/**/*.test.ts'],
    plugins: [
      assert(),
    ],
    reporters: [specReporter()],
    importer: (filePath) => import(filePath),
    timeout: 20000,
  });
  run();
}


const RunBuild = () => {
  const distDir = resolve(__dirname, './dist')
  if (existsSync(distDir)) rmSync(distDir, { recursive: true });
  exec('tsc', () => {
    // for (let file of ['README.md', 'README_ZH.md']) {
    //   copyFileSync(resolve(__dirname, file), distDir + sep + file)
    // }
    copyFileSync(resolve(__dirname, 'README.md'), distDir + sep + 'README.md')
    let json = JSON.parse(readFileSync(resolve(__dirname, 'package.json')).toString('utf8'));
    // _.unset(json, 'devDependencies')
    _.unset(json, 'scripts');
    _.unset(json, 'files');
    writeFileSync(distDir + sep + 'package.json', JSON.stringify(json))
  });


}

isPub ? RunBuild() : RunTest();
