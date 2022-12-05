// import { Pool } from 'pg-navice';
// import fp from 'fastify-plugin';
// import type { PoolConfig, ClientBase } from 'pg'
// import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
// import { setup } from '../pg'
// import type { Settings } from '../base/Util'
// import _ from 'lodash';

// type OorConfig = {
//     PageSize?: number,
//     ShowSQL?: Function;
//     Strict?: boolean | {
//         query?: boolean
//         entity?: boolean,
//     },
// }


// const OOR_FASTIFY_PG: FastifyPluginCallback<PoolConfig> = (fastify: FastifyInstance, options: PoolConfig & OorConfig, next) => {

//     let oorConfig: Settings = {
//         pageSize: options.PageSize || 10,
//         showSQL: options.ShowSQL || console.debug,
//         strict: options.Strict ? options.Strict : false,
//     };
//     _.unset(options, 'PageSize');
//     _.unset(options, 'ShowSQL');
//     _.unset(options, 'Strict');
//     const pool = new Pool(options);
//     oorConfig.provider = () => pool;
//     setup(oorConfig);
//     fastify.addHook('onClose', (fastify, done) => pool.end(done))
//     fastify.decorate('oor', pool);
//     // if(pool.)
//     pool.connect(next)
// }



// declare module 'fastify' {
//     export interface FastifyInstance {
//         oor: ClientBase
//     }
// }

// export default fp(OOR_FASTIFY_PG, { fastify: '4.x', name: '@fastify/oor' }) 
