import { BaseClient } from '../base/db';
import { PgTable } from './PgTable';
import { PgView } from './PgView'



import type { TableOptions } from '../base/BaseView';
import type { TObject } from '@sinclair/typebox';


// export { UType } from '../base/Provider/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
export type { Static } from '@sinclair/typebox';

import type { ClientConfig,  Client, } from 'pg';

export class Pg extends BaseClient<ClientConfig, Client> {


    async getConn(): Promise<Client> {
        // this.options
        return null;
    }


    Table<T extends TObject>(tableName: string, schema: T, options: TableOptions): PgTable<T> {
        return new PgTable(this, tableName, schema, options);
    }

    View<T extends TObject>(tableName: string, schema: T, options: TableOptions): PgView<T> {
        return new PgView(this, tableName, schema, options);
    }

}

// export const

// class PgPool extends BasePool