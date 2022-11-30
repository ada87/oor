// import { expect } from '@japa/expect'
import { assert } from '@japa/assert'
import { specReporter } from '@japa/spec-reporter'
import { configure, run } from '@japa/runner'
process.env.PG_HOST = 'pgserver';
process.env.PG_PORT = '5432';
process.env.PG_USER = 'postgres';
process.env.PG_DB = 'oor'


configure({
    files: ['src/**/*.test.ts'],
    plugins: [
      assert(),
        // runFailedTests()
    ],
    reporters: [specReporter()],
    // reporters:[dotReporter()],
    importer: (filePath) => import(filePath),
    timeout: 2000,
});
run();

// declare module '@japa/runner' {
//     // Interface must match the class name
//     interface TestContext {
//       getTime(): number
//       nodeVersion: string
//       foo: { foo: boolean }
//     }
  
//   }