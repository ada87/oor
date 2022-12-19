import type { TObject, Static } from '@sinclair/typebox';
import type { QuerySchema, WhereParam } from '../../base/types';
import type { SearchHit } from '@elastic/elasticsearch/lib/api/types';

import dayjs from 'dayjs';
import _ from 'lodash';
import { View } from './View'
import { getFieldType, queryToCondition } from '../../base/QueryBuilder';
import { boolValue } from '../../base/Util';
import { where, fixQuery, buildSearch } from './dsl';
import { actions } from './executor'

export class Table<T extends TObject> extends View<T> {

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

    /**
     * Delete documents by match {term:{filed,value}}
    */
    deleteByField(field: string, value: string | number | boolean): Promise<number> {
        const { _CONFIG: { mark, FIELD_MAP } } = this;
        if (mark) return this.updateByField(mark, field, value)
        let schema = FIELD_MAP.get(field);
        let column = (schema && schema.column) ? schema.column : field;
        return this.deleteByCondition([{ column, value }])
    }

    /**
     * Delete documents by a QueryLike Schema
    */
    deleteByQuery(query: QuerySchema): Promise<number> {
        const { _CONFIG: { mark } } = this;
        if (mark) return this.updateByQuery(mark, query)
        const condition = queryToCondition(query, this._CONFIG.FIELD_MAP, this._QUERY_CACHE);
        return this.deleteByCondition(condition);
    }

    deleteByCondition(condition: WhereParam): Promise<number> {
        const { _CONFIG: { mark, globalFilter }, _index } = this;
        if (mark) return this.updateByCondition(mark, condition)
        const param = where(condition)
        const query = fixQuery(globalFilter, param)
        return actions.deleteByQuery(this.getClient(), _index, query);
    }

    /**
     * Delete documents by DOCUMENT._id 
     *  (Not id field in Source) : Source id can use deleteByField('id',xxx);
    */
    deleteById(id: string): Promise<number> {
        const { _CONFIG: { mark } } = this;
        if (mark) return this.update(id, { ...mark, })
        return actions.deleteById(this.getClient(), this._index, id);
    }

    /**
     * Update a record,  by DOCUMENT._id 
     * (Not id field in Source) : Source id can use updateByField(doc, 'id',xxx);
    */
    update(id: string, obj: Static<T>, useIndex = false): Promise<number> {
        const entity = this.checkEntity(obj, false);
        return actions.updateById(this.getClient(), this._index, id, entity, useIndex);
    }
    /**
     * Update documents by match {term:{filed,value}}
    */
    updateByField(obj: Static<T>, field: string, value: string | number | boolean): Promise<number> {
        let column = this.getColumn(field);
        return this.updateByCondition(obj, [{ column, value, fn: '=' }])
    }

    updateByQuery(obj: Static<T>, query: QuerySchema): Promise<number> {
        const condition = queryToCondition(query, this._CONFIG.FIELD_MAP, this._QUERY_CACHE);
        return this.updateByCondition(obj, condition);
    }
    updateByCondition(obj: Static<T>, condition?: WhereParam): Promise<number> {
        const { _index, _CONFIG: { FIELD_MAP, globalFilter } } = this;
        let entity = this.checkEntity(obj);
        const scripts = [];
        for (let key of _.keys(entity)) {
            let column = this.getColumn(key);
            let field = this.getField(key);
            const type = getFieldType(FIELD_MAP.get(field));
            switch (type) {
                case 'boolean':
                    scripts.push(`ctx._source.${column}=${boolValue(entity[key])};`)
                    break
                case 'number':
                    scripts.push(`ctx._source.${column}=${parseFloat(entity[key])};`)
                    break;
                case 'int':
                    scripts.push(`ctx._source.${column}=${parseInt(entity[key])};`)
                    break;
                case 'date':
                    // ISO 8601
                    scripts.push(`ctx._source.${column}='${dayjs(entity[key]).format()}';`);
                    break;
                default:
                    scripts.push(`ctx._source.${column}='${entity[key]}';`);
                    break;
            }
        };
        const param = where(condition);
        const request = buildSearch(_index, param, null, null, globalFilter)
        return actions.updateByQuery(
            this.getClient(),
            this._index,
            request.query,
            {
                source: scripts.join(''),
                lang: "painless"
            })

    }

    /**
     * Insert a record
    */
    add(object: Static<T>): Promise<SearchHit<Static<T>>> {
        let entity = this.checkEntity(object, true)
        return actions.add(this.getClient(), this._index, entity);
    }
}



