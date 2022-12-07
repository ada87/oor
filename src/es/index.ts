import type { Client } from '@elastic/elasticsearch';
import { Settings, setup as _setup } from '../base/Util'


export { UType } from '../base/Util';
export type { WhereParam, WhereCondition, WhereItem, QuerySchema, MagicSuffix, } from '../base/types';
export { Static } from '@sinclair/typebox';

export { View } from './entity/View'

export type ESSettings = Omit<Settings, 'provider'> & {
    provider: () => Client
};

export const setup = (settings: ESSettings) => _setup({ ...settings, provider: ['es', settings.provider], })
