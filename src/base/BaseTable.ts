import _ from 'lodash';
import type { TObject, Static } from '@sinclair/typebox';
import { BaseView } from './BaseView'
import { getFieldType } from './QueryBuilder';


export abstract class BaseTable<T extends TObject> extends BaseView<T> {

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

    // deleteById(id: number | string): Promise<number> {
    //     return deleteById(this.db(), this._table, id, this._CONFIG.key)
    // }

    // update(object: Static<T>): Promise<number> {
    //     let entity = this.checkEntity(object, false);
    //     return update(this.db(), this._table, entity, this._CONFIG.key)
    // }

    // insert(object: Static<T>): Promise<Static<T>> {
    //     let entity = this.checkEntity(object, true);
    //     return insert(this.db(), this._table, entity)
    // }
}



