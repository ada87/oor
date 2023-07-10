import _ from 'lodash';
import fp from 'fastify-plugin';
import { setup } from '../pg/index'

import type { PGSettings } from '../pg/index'
import type { Pool } from 'pg';
import type { FastifyInstance, FastifyPluginCallback } from 'fastify';

const OOR_FASTIFY_PG: FastifyPluginCallback<PGSettings> = (fastify: FastifyInstance, options: PGSettings, next) => {
    let pool = setup(options, next);
    fastify.addHook('onClose', () => pool.end())
    fastify.decorate('opg', pool);
}

declare module 'fastify' {
    export interface FastifyInstance {
        opg: Pool
    }
}

export default fp(OOR_FASTIFY_PG, { fastify: '4.x', name: '@fastify/oor' }) 
