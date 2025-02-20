import _ from 'lodash';
import { BaseView } from './BaseView';

import type { ActionExecutor, ActionBuilder, Table } from './types'
import type { TObject, Static } from '@sinclair/typebox';


// /**
//  * @param tableName Data table name, "${schemaName}.${tableName}"
//  *  "${schemaName}." can be ignore with the default search_path.
//  * @param schema The Object Schema, oor will not validate the value
//  * @param options (Table/View) Options
//  */
// constructor(p: Provider<B>, db: Database<C>, tbName: string, tbSchema: S, tbOptions?: TableOptions) {
//     super(db);
//     const dbOptions = db.getOptions();
//     this.BUILDER = new p(tbName, tbSchema, tbOptions, dbOptions);
//     this.STRICT_QUERY = tbOptions?.strictQuery || dbOptions?.strictQuery || false;
//     this.init();
// }


export class BaseTable<C, S extends TObject, B extends ActionBuilder> extends BaseView<C, S, B> implements Table<Static<S>> {

    protected EXECUTOR: ActionExecutor<C, Static<S>>;


    


    // deleteByField(field: string, value: string | number | boolean): Promise<number> {
    //     const { _CONFIG: { mark, COLUMN_MAP } } = this;
    //     if (mark) return this.updateByField(mark, field, value)
    //     let schema = COLUMN_MAP.get(field);
    //     let column = (schema && schema.column) ? schema.column : field;
    //     return this.deleteByCondition([{ column, value }])
    // }


    // deleteByQuery(query: QuerySchema): Promise<number> {
    //     const { _CONFIG: { mark } } = this;
    //     if (mark) return this.updateByQuery(mark, query)
    //     const condition = queryToCondition(query, this._CONFIG.COLUMN_MAP, this._QUERY_CACHE);
    //     return this.deleteByCondition(condition);
    // }

    // async deleteByCondition(condition: WhereParam): Promise<number> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { mark } } = this;
    //     if (mark) return this.updateByCondition(mark, condition)
    //     const SQL = _BUILDER.delete(_table);
    //     const [WHERE, PARAM] = this._BUILDER.where(condition);
    //     const conn = await this.getConn();
    //     return await _EXECUTOR.execute(conn, `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    // }

    // /**
    //  * Delete a row by primary id
    // */
    // async deleteById(id: number | string): Promise<number> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key, mark } } = this;
    //     if (key == null) throw new Error(`Table ${_table} do not have a Primary Key`);
    //     if (mark) return this.update({ ...mark, [key]: id })
    //     const SQL = _BUILDER.delete(_table);
    //     const [WHERE, PARAM] = _BUILDER.byField(key, id);
    //     const conn = await this.getConn();
    //     return await _EXECUTOR.execute(conn, `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    // }

    // /**
    //  * Update a record, By Primary Key in the obj
    // */
    // async update(obj: Static<S>, returning?: false): Promise<number>;
    // async update(obj: Static<S>, returning: true): Promise<any>;

    // async update(obj: Static<S>, returning: boolean = false): Promise<number | any> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
    //     // if (key == null) throw new Error(`Table ${_table} do not have a Primary Key`);
    //     if (!_.has(obj, key)) throw new Error(`Update Action must have a key`);
    //     let entity = this.checkEntity(obj, false);
    //     const [SQL, FIELD_SET] = _BUILDER.update(_table, entity, key);
    //     if (FIELD_SET.length == 0) {
    //         throw new Error(`Update Action must have some properties`);
    //     }
    //     const [WHERE, PARAM] = _BUILDER.byField(key, obj[key] as any, FIELD_SET.length + 1)
    //     const conn = await this.getConn();
    //     // console.log( `${SQL} ${this.fixWhere(WHERE)}`, [...FIELD_SET, ...PARAM])

    //     return _EXECUTOR.execute(conn, `${SQL} ${this.fixWhere(WHERE)}`, [...FIELD_SET, ...PARAM]);
    // }

    // async updateByField(obj: Static<S>, field: string, value: string | number | boolean): Promise<number> {
    //     let schema = this._CONFIG.COLUMN_MAP.get(field);
    //     let column = (schema && schema.column) ? schema.column : field;
    //     return this.updateByCondition(obj, [{ column, value }])
    // }

    // async updateByQuery(obj: Static<S>, query: QuerySchema): Promise<number> {
    //     const condition = queryToCondition(query, this._CONFIG.COLUMN_MAP, this._QUERY_CACHE);
    //     return this.updateByCondition(obj, condition);
    // }
    // async updateByCondition(obj: Static<S>, condition?: WhereParam): Promise<number> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { key } } = this;
    //     _.unset(obj, key);
    //     let entity = this.checkEntity(obj, false);
    //     if (_.keys(entity).length == 0) return new Promise(r => r(0));
    //     const [SQL, FIELD_SET] = _BUILDER.update(_table, entity);
    //     const [WHERE, PARAM] = this._BUILDER.where(condition, FIELD_SET.length + 1);
    //     const conn = await this.getConn();
    //     return _EXECUTOR.execute(conn, `${SQL} ${this.fixWhere(WHERE)}`, [...FIELD_SET, ...PARAM]);
    // }

    // /**
    //  * Insert a record
    // */
    // async add(object: Static<S>): Promise<Static<S>> {
    //     const { _table, _BUILDER, _EXECUTOR } = this;
    //     let entity = this.checkEntity(object, true);
    //     const [SQL, PARAM] = _BUILDER.insert(_table, entity);
    //     const conn = await this.getConn();
    //     return _EXECUTOR.add(conn, `${SQL}`, PARAM);
    // }
}



