import insert from './insert';
import updateById from './update';
import deleteById from './delete';
import selectById from './select';
import { SqlCrud } from '../../base/sql';
import { whereByCondition } from './QueryWhere'

export const PG: SqlCrud = {
    selectById, insert, deleteById, updateById, whereByCondition
}

export { executor } from './executor'