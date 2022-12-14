// Not Now!
// I was still thing is correct provide this feature ? 

// import type { ClientBase } from 'pg'
// const transactionFailedSymbol = Symbol('transactionFailed')

// function transactionUtil(db: ClientBase, fn, cb) {
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

// function transact(fn, cb) {
//     if (cb && typeof cb === 'function') {
//         return transactionUtil(this, fn, cb)
//     }

//     return new Promise((resolve, reject) => {
//         transactionUtil(this, fn, function (err, res) {
//             if (err) return reject(err)

//             return resolve(res)
//         })
//     })
// }

// function extractRequestClient(req, transact) {
//     if (typeof transact !== 'string') {
//         return req.pg
//     }

//     const requestClient = req.pg[transact]
//     if (!requestClient) {
//         throw new Error(`request client '${transact}' does not exist`)
//     }
//     return requestClient
// }