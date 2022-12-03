import _ from 'lodash';
import type { TObject, Static } from '@sinclair/typebox';
import { BaseView } from './BaseView'
import { getFieldType } from './QueryBuilder';
import { SqlExecutor } from './sql';
import { QuerySchema } from './types';

export abstract class BaseTable<T extends TObject> extends BaseView<T> {
    protected abstract _EXECUTOR: SqlExecutor<T>;

    /**
     * check row data while insert or update
     * and auto warp the data
     * */
    private checkEntity(obj: any, isAdd = false): any {
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

    deleteByQuery(query: QuerySchema): Promise<number> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
        const SQL = _BUILDER.delete(_table);
        const [WHERE, PARAM] = this.whereByQuery(query);
        return _EXECUTOR.execute(this.db(), `${SQL} ${WHERE}`, PARAM);
    }


    deleteById(id: number | string): Promise<number> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
        const SQL = _BUILDER.delete(_table);
        const [WHERE, PARAM] = _BUILDER.byId(id, key);
        return _EXECUTOR.execute(this.db(), `${SQL} ${WHERE}`, PARAM);

    }

    /**
     * Update a record, By Id
    */
    update(object: Static<T>): Promise<number> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
        let entity = this.checkEntity(object, false);
        const [SQL, PARAM] = _BUILDER.update(_table, entity, key);
        return _EXECUTOR.execute(this.db(), `${SQL}`, PARAM);
    }

    updateByQuery(properties: Static<T>, query: QuerySchema) {

    }

    /**
     * Insert a record
    */
    insert(object: Static<T>): Promise<Static<T>> {
        const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
        let entity = this.checkEntity(object, true);
        const [SQL, PARAM] = _BUILDER.insert(_table, entity);
        return _EXECUTOR.add(this.db(), `${SQL}`, PARAM);
    }
}



