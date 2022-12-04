import { insert } from './insert';
import { update } from './update';
import { del } from './delete';
import { select, count, byField } from './select';
import { SqlBuilder } from '../../base/sql';
import { where } from './where';
import { orderBy, limit } from './pagition'

export const PG: SqlBuilder = {
    select, count, insert, delete: del, update, where, orderBy, limit, byField,
}

export { executor } from './executor'