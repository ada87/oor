import { assert } from '@japa/assert'
import { configure, run } from '@japa/runner'
// import { specReporter } from '@japa/spec-reporter'
process.env.PG_HOST = 'pgserver';
process.env.PG_PORT = '5432';
process.env.PG_USER = 'postgres';
process.env.PG_DB = 'oor'


process.env.ES_HOST = 'pgserver';
process.env.ES_PORT = '9200';
process.env.ES_USER = 'elasticsearch';
process.env.ES_PASS = '123456'


// process.env.MY_HOST = 'pgserver';
// process.env.MY_PORT = '3306';
// process.env.MY_USER = 'root';
// process.env.MY_PASS = 'root'
// process.env.MY_DB = 'oor'


configure({
  files: ['src/**/*.test.ts'],
  plugins: [
    assert(),
  ],
  // reporters: [specReporter()],
  importer: (filePath) => import(filePath),
  timeout: 2000,
});
run();