import { assert } from '@japa/assert'
import { configure, run } from '@japa/runner'
import { specReporter } from '@japa/spec-reporter'
process.env.PG_HOST = 'pgserver';
process.env.PG_PORT = '5432';
process.env.PG_USER = 'postgres';
process.env.PG_DB = 'oor'


configure({
    files: ['src/**/*.test.ts'],
    plugins: [
      assert(),
    ],
    reporters: [specReporter()],
    importer: (filePath) => import(filePath),
    timeout: 2000,
});
run();