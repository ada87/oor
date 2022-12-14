import type { FastifyInstance, FastifyPluginCallback } from 'fastify';

import _ from 'lodash';
import fp from 'fastify-plugin';
import { Pool } from 'pg';
import { setup, PGSettings } from '../pg/index'


const OOR_FASTIFY_PG: FastifyPluginCallback<PGSettings> = (fastify: FastifyInstance, options: PGSettings, next) => {
    let pool = setup(options, next);
    fastify.addHook('onClose', () => pool.end())
    fastify.decorate('oor', pool);
    pool.connect(next)
}

declare module 'fastify' {
    export interface FastifyInstance {
        opg: Pool
    }
}

export default fp(OOR_FASTIFY_PG, { fastify: '4.x', name: '@fastify/oor' }) 
