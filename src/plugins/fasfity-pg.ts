import _ from 'lodash';
import fp from 'fastify-plugin';
import { setup } from '../pg/index'

import type { PGSettings } from '../pg/index'
import type { Pool } from 'pg';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

const OOR_FASTIFY_PG: FastifyPluginAsync<PGSettings> = async (fastify: FastifyInstance, options: PGSettings,) => {
    const pool = await setup(options);
    fastify.addHook('onClose', () => pool.end())
    fastify.decorate('opg', pool);
}

declare module 'fastify' {
    export interface FastifyInstance {
        opg: Pool
    }
}

export default fp(OOR_FASTIFY_PG, { fastify: '4.x', name: '@fastify/oor' }) 
