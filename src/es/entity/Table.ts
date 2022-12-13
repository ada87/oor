import type { TObject, Static } from '@sinclair/typebox';
import type { QuerySchema, WhereParam } from '../../base/types';
import type { SearchRequest, SearchResponse, SearchHit, Field, QueryDslBoolQuery, QueryDslQueryContainer, DeleteRequest, UpdateRequest, IndexRequest } from '@elastic/elasticsearch/lib/api/types';

import _ from 'lodash';
import { View } from './View'
import { getFieldType, queryToCondition } from '../../base/QueryBuilder';
import { executor } from '../query/executor';
import { where, fixQuery } from '../query/dsl';

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


    // deleteByField(field: string, value: string | number | boolean): Promise<number> {
    //     const { _CONFIG: { mark, FIELD_MAP } } = this;
    //     if (mark) return this.updateByField(mark, field, value)
    //     let schema = FIELD_MAP.get(field);
    //     let column = (schema && schema.column) ? schema.column : field;
    //     return this.deleteByCondition([{ column, value }])
    // }


    // deleteByQuery(query: QuerySchema): Promise<number> {
    //     const { _CONFIG: { mark } } = this;
    //     if (mark) return this.updateByQuery(mark, query)
    //     const condition = queryToCondition(query, this._CONFIG.FIELD_MAP, this._QUERY_CACHE);
    //     return this.deleteByCondition(condition);
    // }

    deleteByCondition(condition: WhereParam): Promise<number> {
        const { _CONFIG: { globalFilter }, _index } = this;
        // const { _table, _BUILDER, _EXECUTOR, _CONFIG: { mark } } = this;
        // if (mark) return this.updateByCondition(mark, condition)
        // const SQL = _BUILDER.delete(_table);
        const param = where(condition)
        const query = fixQuery(globalFilter, param)
        return executor.deleteByQuery(this.getClient(), _index, query);
    }


    deleteById(id: string): Promise<number> {
        const { _CONFIG: { mark } } = this;
        if (mark) return this.update(id, { ...mark, })
        return executor.deleteById(this.getClient(), this._index, id);
    }

    /**
     * Update a record, By Primary Key in the obj
    */
    update(id: string, obj: Static<T>, useIndex = false): Promise<number> {
        const entity = this.checkEntity(obj, false);
        return executor.updateById(this.getClient(), this._index, id, entity, useIndex);
    }

    // updateByField(obj: Static<T>, field: string, value: string | number | boolean): Promise<number> {
    //     let schema = this._CONFIG.FIELD_MAP.get(field);
    //     let column = (schema && schema.column) ? schema.column : field;
    //     return this.updateByCondition(obj, [{ column, value }])
    // }

    // updateByQuery(obj: Static<T>, query: QuerySchema): Promise<number> {
    //     const condition = queryToCondition(query, this._CONFIG.FIELD_MAP, this._QUERY_CACHE);
    //     return this.updateByCondition(obj, condition);
    // }
    // updateByCondition(obj: Static<T>, condition?: WhereParam): Promise<number> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
    //     _.unset(obj, key);
    //     let entity = this.checkEntity(obj, false);
    //     if (_.keys(entity).length == 0) return new Promise(r => r(0));
    //     const [SQL, FIELD_SET] = _BUILDER.update(_table, entity);
    //     const [WHERE, PARAM] = this._BUILDER.where(condition, FIELD_SET.length + 1);
    //     return _EXECUTOR.execute(this.getClient(), `${SQL} ${this.fixWhere(WHERE)}`, [...FIELD_SET, ...PARAM]);
    // }

    /**
     * Insert a record
    */
    insert(object: Static<T>): Promise<SearchHit<Static<T>>> {
        let entity = this.checkEntity(object, true)
        return executor.add(this.getClient(), this._index, entity);
    }
}



