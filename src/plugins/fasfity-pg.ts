import type { PoolConfig } from 'pg'
import type { FastifyInstance, FastifyPluginCallback } from 'fastify';
import type { Settings } from '../base/Util'

import _ from 'lodash';
import fp from 'fastify-plugin';
import { Pool } from 'pg';
import { setup } from '../pg/index'

type OOR_CONFIG = Omit<Settings, 'provider'>;

const OOR_FASTIFY_PG: FastifyPluginCallback<PoolConfig> = (fastify: FastifyInstance, options: PoolConfig & OOR_CONFIG, next) => {
    let oorConfig: OOR_CONFIG = {
        pageSize: options.pageSize || 10,
        showSQL: options.showSQL || console.debug,
        strict: options.strict || false,
    };
    _.unset(options, 'pageSize');
    _.unset(options, 'showSQL');
    _.unset(options, 'strict');
    const pool = new Pool(options);
    setup({ ...oorConfig, provider: () => pool });
    fastify.addHook('onClose', () => pool.end())
    fastify.decorate('oor', pool);
    pool.connect(next)
}

declare module 'fastify' {
    export interface FastifyInstance {
        oor: Pool
    }
}

export default fp(OOR_FASTIFY_PG, { fastify: '4.x', name: '@fastify/oor' }) 
