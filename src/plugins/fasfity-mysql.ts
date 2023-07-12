import _ from 'lodash';
import fp from 'fastify-plugin';
import { setup } from '../mysql/index'

import type { MySqlSettings } from '../mysql/index';
import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import type { Pool } from 'mysql2/promise';

const OOR_FASTIFY_MY: FastifyPluginCallback<MySqlSettings> = (fastify: FastifyInstance, options: MySqlSettings, next) => {
    let pool = setup(options, next);
    fastify.addHook('onClose', () => pool.end())
    fastify.decorate('omy', pool);
}

declare module 'fastify' {
    export interface FastifyInstance {
        omy: Pool
    }
}

export default fp(OOR_FASTIFY_MY, { fastify: '4.x', name: '@fastify/oor' }) 
