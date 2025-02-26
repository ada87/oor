import _ from './dash';
import { BaseQuery } from './SqlQuery';
import { buildCheckEntity } from './utils'
import { RETURN } from '../utils/types';
import { newDate } from '../utils/TimeUtil';

import type { TableOptions, DatabaseOptions, InsertOptions, UpdateOptions } from './types'
import type { SQLStatement, RowKeyType } from '../utils/types';
import type { TObject } from '@sinclair/typebox';
import type { ActionBuilder } from './index'


export abstract class BaseAction extends BaseQuery implements ActionBuilder {

    protected checkEntity: (obj: object, isAdd: boolean) => object;

    private DATE_MODIFY: Set<string>;
    private DATE_CREATE: Set<string>;

    constructor(tbName: string, tbSchema: TObject, tbOptions: TableOptions, dbOptions: DatabaseOptions) {
        super(tbName, tbSchema, tbOptions, dbOptions);
        this.checkEntity = buildCheckEntity(this.SCHEMA, this.COLUMN_MAP, this.C2F, this.STRICT_ENTITY);
        this.DATE_CREATE = new Set();
        this.DATE_MODIFY = new Set();
        _.keys(this.SCHEMA.properties).forEach(field => {
            let column = this.SCHEMA.properties[field];
            if (column.type == 'Date') {
                if (column.isCreate) {
                    this.DATE_CREATE.add(field);
                }
                if (column.isModify) {
                    this.DATE_MODIFY.add(field);
                }
            }
        })
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

    private insertArray(list: Array<object>, options?: InsertOptions): SQLStatement {
        let isAutoIncrement = false;
        if (options && _.has(options, 'isAutoIncrement')) {
            isAutoIncrement = options.isAutoIncrement;
        } else if (this.ROW_KEY) {
            const columnSchema = this.COLUMN_MAP.get(this.ROW_KEY);
            if (columnSchema.type == 'integer') {
                isAutoIncrement = true;
            }
        }
        const FIELDS = _.keys(this.SCHEMA.properties).filter(key => {
            if (isAutoIncrement) return key != this.ROW_KEY;
            return true;
        })
        const COLUMNS = FIELDS.map(field => this.COLUMN_MAP.get(field));
        const QUERY = FIELDS.map(field => this.F2W.get(field)).join(',');
        let group: string[] = [];
        let param: any[] = [];
        let idx = 1;
        for (let obj of list) {
            let items: string[] = []
            FIELDS.forEach((field, i) => {
                let schema = COLUMNS[i];
                items.push('$' + idx);
                idx = idx + 1;
                if (this.DATE_CREATE.has(field) || this.DATE_MODIFY.has(field)) {
                    param.push(newDate(schema));
                } else {
                    let value = _.has(obj, field) ? obj[field] : null;
                    if (value == null && schema.default != undefined) value = schema.default;
                    param.push(value);
                }
            });
            group.push('(' + items.join(',') + ')');
        }

        return [`INSERT INTO ${this.tableName} (${QUERY}) VALUES ${group.join(',')}`, param];

    }

    insert(obj: object, options?: InsertOptions): SQLStatement {
        if (_.isArray(obj)) return this.insertArray(obj, options);
        const fields = _.keys(obj);
        if (fields.length == 0) throw new Error('No field to insert');
        let query = [];
        let idx = [];
        let param = [];
        fields.map((field, i) => {
            if (this.DATE_CREATE.has(field) || this.DATE_MODIFY.has(field)) return;
            let val = obj[field];
            if (val === null) return
            query.push(this.F2W.get(field))
            idx.push("$" + (i + 1));
            param.push(val)
        });
        _.keys(this.SCHEMA.properties).forEach(field => {
            let column = this.SCHEMA.properties[field];
            if (this.DATE_CREATE.has(field) || this.DATE_MODIFY.has(field)) {
                query.push(this.F2W.get(field))
                idx.push("$" + (param.length + 1));
                param.push(newDate(column));
            } else if (_.has(column, 'default') && !_.has(obj, field)) {
                query.push(this.F2W.get(field));
                idx.push("$" + (param.length + 1));
                param.push(column.default);
            }
        })
        return [`INSERT INTO ${this.tableName} (${query.join(',')}) VALUES (${idx.join(',')})`, param];
    };

    update(obj: object, options?: UpdateOptions): SQLStatement {
        if (this.ROW_KEY == null) throw new Error('Could not load a row key in table : ' + this.tableName);
        const data = this.checkEntity(obj, false)
        if (!_.has(data, this.ROW_KEY)) throw new Error('Could not load a row key in entity ');
        const fields = _.keys(data);
        if (fields.length <= 1) throw new Error('No Columns to update');
        let query = [];
        let param = [];
        let pos = 1;
        for (const field of fields) {
            if (field == this.ROW_KEY || this.DATE_CREATE.has(field) || this.DATE_MODIFY.has(field)) continue;
            let val = data[field];
            if (options?.ignoreNull && (val === null || val === undefined)) continue;
            query.push(`${this.F2W.get(field)} = $${pos}`)
            param.push(val)
            pos++
        }
        
        for (let filed of this.DATE_MODIFY) {
            query.push(`${this.F2W.get(filed)} = $${pos}`)
            param.push(newDate(this.COLUMN_MAP.get(filed)))
            pos++
        }
        return [`UPDATE ${this.tableName} SET ${query.join(',')}`, param];
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