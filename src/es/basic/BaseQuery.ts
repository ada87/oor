import { PROVIDERS } from '../../base/Providers';

import type { Client } from '@elastic/elasticsearch';
import type { SearchResponse, SearchRequest } from '@elastic/elasticsearch/lib/api/types';


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
    search(requset: SearchRequest): Promise<SearchResponse> {
        return this.getClient().search(requset);
    }
}