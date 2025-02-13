import _ from 'lodash';

import { Pool, QueryResult } from 'pg';
import { Settings, setup as _setup } from '../base/Provider/Util'
import { SqlBuilder, SqlExecutor } from '../base/sql';
import { getFieldType } from '../base/QueryBuilder';
import { BaseView, TableOptions } from '../base/BaseView';
import { BaseTable } from '../base/BaseTable';
import { insert, update, del, select, count, byField, orderBy, limit } from './basic/builder';
import { where, fixWhere } from './basic/where'
import { executor } from './basic/executor'

import type { DB_TYPE } from '../base/types';
import type { Static, TObject } from '@sinclair/typebox';

// Export Some useful global apis/types.
export { UType } from '../base/Provider/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';

export type { Static } from '@sinclair/typebox';

const PG: SqlBuilder = { select, count, insert, delete: del, update, where, orderBy, limit, byField, }

import { BaseClient } from '../base/db'

import type { ClientConfig, PoolConfig, Client, ClientBase, PoolClient, } from 'pg';


export type PGSettings = Omit<Settings, 'provider'> & {
    provider: PoolConfig | (() => ClientBase | Pool)
};

export const setup = async (settings: PGSettings): Promise<Pool> => {
    let pool: Pool;
    if (_.isFunction(settings.provider)) {
        pool = settings.provider() as Pool;
    } else {
        pool = new Pool(settings.provider);
        await pool.connect();
    }
    _setup({ ...settings, provider: ['pg', () => pool], })
    return pool;
}