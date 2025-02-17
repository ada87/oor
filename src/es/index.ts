import _ from 'lodash';
// import { Settings, setup as _setup } from '../base/Provider/Util'
import type { Client } from '@elastic/elasticsearch';

import type { ClientOptions } from '@elastic/elasticsearch';


export { UType } from '../base/Util';
export { Static } from '@sinclair/typebox';
export { View, FlatView } from './basic/View'
export { Table } from './basic/Table'


export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';

// export type ESSettings = Omit<Settings, 'provider'> & {
//     provider: ClientOptions | (() => Client)
// };



/**
 * Setup Elastic Search Connection with config
*/
// export const setup = async (settings: ESSettings): Promise<Client> => {
//     let client: Client;
//     if (_.isFunction(settings.provider)) {
//         client = settings.provider();
//     } else {
//         client = new Client(settings.provider);
//     }
//     _setup({ ...settings, provider: ['es', () => client], })
//     return client;
// }