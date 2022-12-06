import type { TObject, Static } from '@sinclair/typebox';
import type { QuerySchema, WhereParam } from './types';

import _ from 'lodash';
import { BaseView } from './BaseView'
import { getFieldType, queryToCondition } from './QueryBuilder';
import { SqlExecutor } from './sql';

export abstract class BaseTable<T extends TObject> extends BaseView<T> {

    protected abstract _EXECUTOR: SqlExecutor<T>;

    /**
     * Auto convert data
     * check row data while insert or update
     * */
    private checkEntity(obj: any, isAdd = false): any {
        // checkEntity(this.schema)
        let clone: any = {}
        this._CONFIG.FIELD_MAP.forEach((schema, key) => {
            let field = schema.column || key;
            if (_.has(obj, key)) {
                clone[field] = obj[key];
            }
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
            }
        })
        return clone;
    }


    deleteByField(field: string, value: string | number | boolean): Promise<number> {
        const { _CONFIG: { mark, FIELD_MAP } } = this;
        if (mark) return this.updateByField(mark, field, value)
        let schema = FIELD_MAP.get(field);
        let column = (schema && schema.column) ? schema.column : field;
        return this.deleteByCondition([{ column, value }])
    }


    deleteByQuery(query: QuerySchema): Promise<number> {
        const { _CONFIG: { mark } } = this;
        if (mark) return this.updateByQuery(mark, query)
        const condition = queryToCondition(query, this._CONFIG.FIELD_MAP, this._QUERY_CACHE);
        return this.deleteByCondition(condition);
    }

    deleteByCondition(condition: WhereParam): Promise<number> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { mark } } = this;
        if (mark) return this.updateByCondition(mark, condition)
        const SQL = _BUILDER.delete(_table);
        const [WHERE, PARAM] = this._BUILDER.where(condition);
        return _EXECUTOR.execute(this.db(), `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    }


    deleteById(id: number | string): Promise<number> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key, mark } } = this;
        if (mark) return this.update({ ...mark, [key]: id })
        const SQL = _BUILDER.delete(_table);
        const [WHERE, PARAM] = _BUILDER.byField(key, id);
        return _EXECUTOR.execute(this.db(), `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    }

    /**
     * Update a record, By Primary Key in the obj
    */
    update(obj: Static<T>): Promise<number> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
        if (!_.has(obj, key)) {
            throw new Error(`Update Action must have a key`);
        }
        let entity = this.checkEntity(obj, false);
        const [SQL, FIELD_SET] = _BUILDER.update(_table, entity, key);
        if (FIELD_SET.length == 0) {
            throw new Error(`Update Action must have some properties`);
        }
        const [WHERE, PARAM] = _BUILDER.byField(key, obj[key] as any, FIELD_SET.length + 1)
        return _EXECUTOR.execute(this.db(), `${SQL} ${this.fixWhere(WHERE)}`, [...FIELD_SET, ...PARAM]);
    }

    updateByField(obj: Static<T>, field: string, value: string | number | boolean): Promise<number> {
        let schema = this._CONFIG.FIELD_MAP.get(field);
        let column = (schema && schema.column) ? schema.column : field;
        return this.updateByCondition(obj, [{ column, value }])
    }

    updateByQuery(obj: Static<T>, query: QuerySchema): Promise<number> {
        const condition = queryToCondition(query, this._CONFIG.FIELD_MAP, this._QUERY_CACHE);
        return this.updateByCondition(obj, condition);
    }
    updateByCondition(obj: Static<T>, condition?: WhereParam): Promise<number> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
        _.unset(obj, key);
        let entity = this.checkEntity(obj, false);
        if (_.keys(entity).length == 0) return new Promise(r => r(0));
        const [SQL, FIELD_SET] = _BUILDER.update(_table, entity);
        const [WHERE, PARAM] = this._BUILDER.where(condition, FIELD_SET.length + 1);
        return _EXECUTOR.execute(this.db(), `${SQL} ${this.fixWhere(WHERE)}`, [...FIELD_SET, ...PARAM]);
    }

    /**
     * Insert a record
    */
    insert(object: Static<T>): Promise<Static<T>> {
        const { _table, _BUILDER, _EXECUTOR } = this;
        let entity = this.checkEntity(object, true);
        const [SQL, PARAM] = _BUILDER.insert(_table, entity);
        return _EXECUTOR.add(this.db(), `${SQL}`, PARAM);
    }
}



