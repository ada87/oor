import { BaseQueryBuilder } from './QueryBuilder';

import type { TObject } from '@sinclair/typebox';
import type { ActionBuilder } from './index'



export class BaseActionBuilder extends BaseQueryBuilder implements ActionBuilder {
    insert: (data: TObject, returning?: boolean) => [string, any[]];
    update: (data: TObject, returning?: boolean) => [string, any[]];
    delete: () => string;
}