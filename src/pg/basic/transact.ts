// I was still thing is correct provide this feature ? 
// import type { Pool, PoolClient } from 'pg'

// type TX = (conn: PoolClient, commit?: (err, res) => void) => (void | Promise<void>);

// const WarpTransact = (db: Pool, fn: TX, cb: Function) => {

//     db.connect((err, client, done) => {
//         if (err) return cb(err)

//         const shouldAbort = (err) => {
//             if (err) {
//                 client.query('ROLLBACK', done)
//             }

//             return !!err
//         }

//         const commit = (err, res) => {
//             if (shouldAbort(err)) return cb(err)

//             client.query('COMMIT', (err) => {
//                 done()
//                 if (err) return cb(err)

//                 return cb(null, res)
//             })
//         }

//         client.query('BEGIN', (err) => {
//             if (shouldAbort(err)) return cb(err)

//             const promise = fn(client, commit)

//             if (promise && typeof promise.then === 'function') {
//                 promise.then((res) => commit(null, res), (e) => commit(e, null))
//             }
//         })
//     })
// }

// const tx = (fn: TX) => new Promise((resolve, reject) => WarpTransact(this, fn, (err, res) => {
//     if (err) return reject(err)
//     return resolve(res)
// }))


