// import type { SqlBuilder, BaseSqlExecutor } from '../../base/sql';
// import type { SearchRequest, SearchResponse, SearchHit, Field } from '@elastic/elasticsearch/lib/api/types';
import type { Client } from '@elastic/elasticsearch';

import { PROVIDERS } from '../../base/Providers';
import { Static, TObject } from '@sinclair/typebox';

// import type { DB_TYPE } from '../../base/types';
export abstract class BaseQuery<T extends TObject> {


    /**
     * Get Database connection form provider
    */
    getClient(): Client {
        return PROVIDERS.es();
    }



}