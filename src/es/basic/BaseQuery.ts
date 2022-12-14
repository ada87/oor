import type { Client } from '@elastic/elasticsearch';

import { PROVIDERS } from '../../base/Providers';

export abstract class BaseQuery {

    /**
     * Get Database connection form provider
    */
    getClient(): Client {
        return PROVIDERS.es();
    }

}