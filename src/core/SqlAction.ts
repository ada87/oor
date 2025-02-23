import _ from './dash';
import { BaseQuery } from './SqlQuery';
// import { getFieldType } from '../    utils/SQLUtil';
// import { toDate } from '../utils/TimeUtil';
import { RETURN } from '../utils/types';

import type { SQLStatement } from '../utils/types';
import type { TObject } from '@sinclair/typebox';
import type { ActionBuilder } from './index'


export abstract class BaseAction extends BaseQuery implements ActionBuilder {

    insert(obj: object): SQLStatement {
        const fields = _.keys(obj);
        if (fields.length == 0) throw new Error('No field to insert');

        // this.COLUMN_MAP

        let query = [];
        let idx = [];
        let param = [];

        fields.map((field, i) => {
            let val = obj[field];
            if (val === null) {
                return
            }
            query.push(field)
            idx.push("$" + (i + 1));
            param.push(val)
        })
        return [`INSERT INTO ${this.tableName} (${query.join(',')}) VALUES (${idx.join(',')})`, param];

    };
    update(obj: object): SQLStatement {
        const fields = _.keys(obj);
        if (fields.length == 0) throw new Error();
        let query = [];
        let param = [];

        let diff = 1;
        fields.map((field, i) => {
            // Not Allow Update Primary Key
            if (field == this.ROW_KEY) {
                diff = 0;
                return;
            }
            let val = obj[field];
            query.push(`${field} = $${i + diff}`)
            param.push(val)
        });

        return [`UPDATE  ${this.tableName} SET ${query.join(',')}`, param];
    }

    delete(): SQLStatement {
        return [`DELETE FROM ${this.tableName}`, []]
    }

    returning(returning: RETURN) {

        switch (returning) {
            case RETURN.SUCCESS:
            case RETURN.COUNT:
                return ''
            case RETURN.INFO:
                return 'RETURNING ' + this.DETAIL_FIELDS;
            case RETURN.KEY:
                if (this.ROW_KEY == null) throw (`This table has no primary key`);
                return 'RETURNING ' + this.wrapField(this.ROW_KEY);
            default:
                return '';
        }
    }

}