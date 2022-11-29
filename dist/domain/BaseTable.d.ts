import type { TObject, Static } from '@sinclair/typebox';
import { BaseView } from './BaseView';
export declare class BaseTable<T extends TObject> extends BaseView<T> {
    /**
     * check row data while insert or update
     * and auto warp the data
     * */
    private checkEntity;
    deleteById(id: number | string): Promise<number>;
    update(object: Static<T>): Promise<number>;
    insert(object: Static<T>): Promise<Static<T>>;
}
