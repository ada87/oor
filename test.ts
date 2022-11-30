import { expect } from '@japa/expect'
import { specReporter } from '@japa/spec-reporter'
import { runFailedTests } from '@japa/run-failed-tests'
import { configure, run } from '@japa/runner'
process.env.PG_HOST = 'pgserver';
process.env.PG_PORT = '5432';
process.env.PG_USER = 'postgres';
process.env.PG_DB = 'oor'


configure({
    files: ['src/**/*.test.ts'],
    plugins: [
        expect(),
        runFailedTests()
    ],
    reporters: [specReporter()],
    importer: (filePath) => import(filePath),
    timeout: 2000,
});
run();