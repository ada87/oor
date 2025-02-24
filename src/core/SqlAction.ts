import _ from './dash';
import { BaseQuery } from './SqlQuery';
import { buildCheckEntity } from './utils'
// import { getFieldType } from '../    utils/SQLUtil';
// import { toDate } from '../utils/TimeUtil';
import { RETURN } from '../utils/types';
// import { buildCheckEntity } from '../utils/ValidateUtil';

import type { TableOptions, DatabaseOptions } from './types'
import type { SQLStatement, RowKeyType } from '../utils/types';
import type { TObject } from '@sinclair/typebox';
import type { ActionBuilder } from './index'


export abstract class BaseAction extends BaseQuery implements ActionBuilder {

    protected checkEntity: (obj: object, isAdd: boolean) => object;

    constructor(tbName: string, tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions) {
        super(tbName, tbSchema, tbOptions, dbOptions);
        this.checkEntity = buildCheckEntity(this.SCHEMA, this.COLUMN_MAP, this.C2F, this.STRICT_ENTITY);
    }

    whereId(value: RowKeyType | Array<RowKeyType> | object | Array<RowKeyType>, startIdx: number = 1): SQLStatement {
        if (this.ROW_KEY == null) throw ('Row Key is not defined');
        let type = typeof value;
        if (_.isArray(value)) {
            const ids = [];
            for (let obj of value) {
                let type = typeof obj;
                if (type == 'number' || type == 'string') {
                    ids.push(obj)
                }
                if (_.has(obj, this.ROW_KEY)) {
                    ids.push(obj[this.ROW_KEY])
                } else {
                    if (this.STRICT_ENTITY) throw new Error('Could not load a row key in entity ');
                }
            }
            if (ids.length == 0) throw new Error('No row key in entity');
            if (ids.length == 1) return [`${this.F2W.get(this.ROW_KEY)} = $${startIdx}`, [ids[0]]];
            return [`${this.F2W.get(this.ROW_KEY)} = ANY($${startIdx})`, [ids]];

        }

        let rowKey = null;
        if (type == 'number' || type == 'string') {
            rowKey = value;
        } else if (type == 'object' && _.has(value, this.ROW_KEY)) {
            rowKey = value[this.ROW_KEY];
        }

        return [`${this.F2W.get(this.ROW_KEY)} = $${startIdx}`, [rowKey]]
    }



    insert(obj: object, ignoreNull = false): SQLStatement {
        const fields = _.keys(obj);
        if (fields.length == 0) throw new Error('No field to insert');
        let query = [];
        let idx = [];
        let param = [];
        fields.map((field, i) => {
            let val = obj[field];
            if (val === null) return
            query.push(field)
            idx.push("$" + (i + 1));
            param.push(val)
        })
        return [`INSERT INTO ${this.tableName} (${query.join(',')}) VALUES (${idx.join(',')})`, param];
    };

    update(obj: object, ignoreNull = false): SQLStatement {
        if (this.ROW_KEY == null) throw new Error('Could not load a row key in table : ' + this.tableName);
        const data = this.checkEntity(obj, false)
        if (!_.has(data, this.ROW_KEY)) throw new Error('Could not load a row key in entity ');
        const fields = _.keys(data);
        if (fields.length <= 1) throw new Error('No Columns to update');
        let query = [];
        let param = [];
        let pos = 1;
        for (const field of fields) {
            if (field == this.ROW_KEY) continue;
            let val = data[field];
            if (ignoreNull && (val === null || val === undefined)) continue;
            query.push(`${this.F2W.get(field)} = $${pos}`)
            param.push(val)
            pos++
        }
        return [`UPDATE  ${this.tableName} SET ${query.join(',')}`, param];
    }

    delete(): SQLStatement {
        if (this.DEL_MARK) return [`UPDATE ${this.tableName} SET ${this.DEL_MARK.column} = $1`, [this.DEL_MARK.value]]
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