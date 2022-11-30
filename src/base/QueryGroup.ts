import type { WhereItem, WhereCondition, QuerySchema } from './types'
import _ from 'lodash';


export const GroupBy = (query: QuerySchema) => {

    const ROOT: WhereCondition = { link: 'AND', items: [] };
    _.keys(query).map(key => {
        console.log(key)
    })

}