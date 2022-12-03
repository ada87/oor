import { insert } from './insert';
import { update } from './update';
import { del } from './delete';
import { select, count, byId } from './select';
import { SqlBuilder } from '../../base/sql';
import { where } from './where';
import { orderBy, limit } from './pagition'

export const PG: SqlBuilder = {
    select, insert, delete: del, update, where, orderBy, limit, byId, count
}

export { executor } from './executor'