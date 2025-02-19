import _ from 'lodash';
import { BaseQueryBuilder } from './SqlQuery';
import { getFieldType } from '../utils/SQLUtil';
import { toDate } from '../utils/TimeUtil';

import type { TObject } from '@sinclair/typebox';
import type { ActionBuilder } from './index'



export abstract class BaseActionBuilder extends BaseQueryBuilder implements ActionBuilder {

    /**
     * Auto convert data
     * check row data while insert or update
     * */
    protected checkEntity(obj: any, isAdd = false): any {
        // checkEntity(this.schema)
        let clone: any = {}
        this.COLUMN_MAP.forEach((schema, key) => {
            let field = schema.column || key;
            if (_.has(obj, key)) clone[field] = obj[key];
            let type = getFieldType(schema);
            if (type == 'date') {
                if (schema.isCreate) {
                    if (isAdd) {
                        clone[field] = new Date();
                    } else {
                        _.unset(clone, field);
                    }
                    return;
                }
                if (schema.isModify) {
                    clone[field] = new Date();
                    return;
                }
                if (obj[key] === null || obj[key] === 0) {
                    clone[field] = null;
                } else {
                    clone[field] = toDate(obj[key]);
                }
            }
        })
        return clone;
    }

    abstract insert: (data: TObject, returning?: boolean) => [string, any[]];
    abstract update: (data: TObject, returning?: boolean) => [string, any[]];
    abstract delete: () => string;
}