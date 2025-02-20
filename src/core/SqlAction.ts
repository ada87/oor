import { BaseQuery } from './SqlQuery';
import { getFieldType } from '../utils/SQLUtil';
import { toDate } from '../utils/TimeUtil';

import type { TObject } from '@sinclair/typebox';
import type { ActionBuilder } from './index'



export abstract class BaseAction extends BaseQuery implements ActionBuilder {


    // abstract insert: (data: TObject, returning?: boolean) => [string, any[]];
    // abstract update: (data: TObject, returning?: boolean) => [string, any[]];
    // abstract delete: () => string;
}