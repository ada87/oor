import _ from 'lodash';
import { Client } from '@elastic/elasticsearch';
import type { ClientOptions } from '@elastic/elasticsearch';
import { Settings, setup as _setup } from '../base/Util'


export { UType } from '../base/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
export { Static } from '@sinclair/typebox';
export { View, FlatView } from './basic/View'
export { Table } from './basic/Table'

export type ESSettings = Omit<Settings, 'provider'> & {
    provider: ClientOptions | (() => Client)
};




export const setup = (settings: ESSettings): Client => {
    if (_.isFunction(settings.provider)) {
        _setup({ ...settings, provider: ['es', settings.provider], })
        return settings.provider();
    } else {
        const client = new Client(settings.provider);
        _setup({ ...settings, provider: ['es', () => client], })
        return client;
    }
}