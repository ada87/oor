import type { Client } from '@elastic/elasticsearch';
import type { SearchResponse, SearchRequest } from '@elastic/elasticsearch/lib/api/types';

import { PROVIDERS } from '../../base/Providers';

export abstract class BaseQuery {

    /**
     * Get Database connection form provider
    */
    getClient(): Client {
        return PROVIDERS.es();
    }

    /**
     * Execute a custom search Request
    */
    exec(requset: SearchRequest): Promise<SearchResponse> {
        return this.getClient().search(requset);
    }
}