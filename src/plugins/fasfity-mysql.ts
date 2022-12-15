import type { FastifyInstance, FastifyPluginCallback } from 'fastify';

import _ from 'lodash';
import fp from 'fastify-plugin';
import { Pool } from 'mysql2/promise';
import { setup, MYSettings } from '../mysql/index'


const OOR_FASTIFY_MY: FastifyPluginCallback<MYSettings> = (fastify: FastifyInstance, options: MYSettings, next) => {
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
