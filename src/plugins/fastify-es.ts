import _ from 'lodash';
import fp from 'fastify-plugin';
import { Client } from '@elastic/elasticsearch';
import { setup } from '../es/index'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { ESSettings } from '../es/index';


const OOR_FASTIFY_ES: FastifyPluginAsync<ESSettings> = async (fastify: FastifyInstance, options: ESSettings) => {
    const client = await setup(options)
    fastify.decorate('oes', client);
}

declare module 'fastify' {
    export interface FastifyInstance {
        oes: Client
    }
}

export default fp(OOR_FASTIFY_ES, { fastify: '4.x', name: '@fastify/oor' }) 
