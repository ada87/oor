import { BaseView } from './BaseView';
import { RETURN } from '../utils/types';

import type { ActionExecutor, ActionBuilder, Table, } from './types'
import type { TObject, Static } from '@sinclair/typebox';
import type { QueryParam, WhereParam, SQLStatement, QuerySchema, QueryOrderBy, RowKeyType } from '../utils/types';



export class BaseTable<C, S extends TObject, B extends ActionBuilder, R = any> extends BaseView<C, S, B> implements Table<Static<S>, R> {

    protected EXECUTOR: ActionExecutor<C, Static<S>>;



    protected async _execute(ACTION: SQLStatement, returning: RETURN, WHERE?: SQLStatement,): Promise<any> {
        const { EXECUTOR, BUILDER } = this;
        const RETURNING = BUILDER.returning(returning);
        const RE_WHERE = BUILDER.fixWhere([WHERE ? WHERE[0] : '', WHERE ? [...ACTION[1], ...WHERE[1]] : []]);
        const SQL = `${ACTION[0]} ${RE_WHERE[0] ? `WHERE ${RE_WHERE[0]}` : ''} ${RETURNING}`
        const conn = await this.getConn();
        const result = await EXECUTOR.execute(conn, SQL, RE_WHERE[1]);
        const rtn = EXECUTOR.convert(result, returning);
        return rtn;
    }

    protected async _executeBatch(ACTION: SQLStatement, returning: RETURN, WHERE?: SQLStatement) {
        const { EXECUTOR, BUILDER } = this;
        const RETURNING = BUILDER.returning(returning);
        let SQL: string, PARAM: any[];
        if (WHERE && WHERE[0]) {
            SQL = `${ACTION[0]} WHERE ${WHERE[0]} ${RETURNING}`
            PARAM = [...ACTION[1], ...WHERE[1]];
        } else {
            SQL = `${ACTION[0]}  ${RETURNING}`
            PARAM = ACTION[1];
        }
        const conn = await this.getConn();
        const result = await EXECUTOR.execute(conn, SQL, PARAM);
        const rtn = EXECUTOR.convertBatch(result, returning);
        return rtn;
    }


    /**
     * Insert a record
    */
    async add(data: Static<S>, returnType?: RETURN): Promise<Static<S>>;
    async add(data: Static<S>, returnType: RETURN.SUCCESS): Promise<boolean>;
    async add(data: Static<S>, returnType: RETURN.COUNT): Promise<number>;
    async add(data: Static<S>, returnType: RETURN.INFO): Promise<Static<S>>;
    async add(data: Static<S>, returnType: RETURN.KEY): Promise<RowKeyType>;
    async add(data: Static<S>, returnType: RETURN.ORIGIN): Promise<R>;
    async add(data: Static<S>, returnType: RETURN = RETURN.INFO): Promise<any> {
        const { BUILDER } = this;
        const STATEMENT = BUILDER.insert(data);
        const result = await this._execute(STATEMENT, returnType);
        return result as any;
    }


    /**
     * Update a record (By ID)
    */
    async update(data: Static<S>, returnType?: RETURN): Promise<boolean>;
    async update(data: Static<S>, returnType: RETURN.SUCCESS, ignoreNull?: boolean): Promise<boolean>;
    async update(data: Static<S>, returnType: RETURN.COUNT, ignoreNull?: boolean): Promise<number>;
    async update(data: Static<S>, returnType: RETURN.INFO, ignoreNull?: boolean): Promise<Static<S>>;
    async update(data: Static<S>, returnType: RETURN.KEY, ignoreNull?: boolean): Promise<RowKeyType>;
    async update(data: Static<S>, returnType: RETURN.ORIGIN, ignoreNull?: boolean): Promise<R>;
    async update(data: Static<S>, returnType: RETURN = RETURN.SUCCESS, ignoreNull: boolean = false): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.update(data, ignoreNull);
        const WHERE = BUILDER.whereId(data, ACTION[1].length + 1);
        const result = await this._execute(ACTION, returnType, WHERE);
        return result;
    }

    /**
     * Delete a row by primary id
    */

    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType?: RETURN): Promise<boolean>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: RETURN.SUCCESS, ignoreNull?: boolean): Promise<boolean>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: RETURN.COUNT, ignoreNull?: boolean): Promise<number>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: RETURN.INFO, ignoreNull?: boolean): Promise<Static<S>>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: RETURN.KEY, ignoreNull?: boolean): Promise<Partial<Static<S>>>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: RETURN.ORIGIN, ignoreNull?: boolean): Promise<R>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: RETURN = RETURN.SUCCESS): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.delete();
        const WHERE = BUILDER.whereId(id, ACTION[1].length + 1);
        const result = await this._execute(ACTION, returnType, WHERE);
        return result;
    }

    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType?: RETURN): Promise<number>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: RETURN.SUCCESS, ignoreNull?: boolean): Promise<boolean>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: RETURN.COUNT, ignoreNull?: boolean): Promise<number>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: RETURN.INFO, ignoreNull?: boolean): Promise<Array<Static<S>>>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: RETURN.KEY, ignoreNull?: boolean): Promise<Array<Partial<Static<S>>>>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: RETURN.ORIGIN, ignoreNull?: boolean): Promise<R>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType = RETURN.COUNT): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.delete();
        const WHERE = BUILDER.whereId(ids, ACTION[1].length + 1);
        const result = await this._executeBatch(ACTION, returnType, WHERE);
        return result;
    }




    async deleteByField(field: string, value: string | number | boolean, returnType?: RETURN): Promise<number>;
    async deleteByField(field: string, value: string | number | boolean, returnType: RETURN.SUCCESS): Promise<boolean>;
    async deleteByField(field: string, value: string | number | boolean, returnType: RETURN.COUNT): Promise<number>;
    async deleteByField(field: string, value: string | number | boolean, returnType: RETURN.INFO): Promise<Array<Static<S>>>;
    async deleteByField(field: string, value: string | number | boolean, returnType: RETURN.KEY): Promise<Array<Partial<Static<S>>>>;
    async deleteByField(field: string, value: string | number | boolean, returnType: RETURN.ORIGIN): Promise<R>;
    async deleteByField(field: string, value: string | number | boolean, returnType = RETURN.COUNT): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.delete();
        const WHERE = BUILDER.byField(field, value, ACTION[1].length + 1);
        const result = await this._executeBatch(ACTION, returnType, WHERE);
        return result;
    }

    async deleteByWhere(where: WhereParam, returnType?: RETURN): Promise<number>;
    async deleteByWhere(where: WhereParam, returnType: RETURN.SUCCESS): Promise<boolean>;
    async deleteByWhere(where: WhereParam, returnType: RETURN.COUNT): Promise<number>;
    async deleteByWhere(where: WhereParam, returnType: RETURN.INFO): Promise<Array<Static<S>>>;
    async deleteByWhere(where: WhereParam, returnType: RETURN.KEY): Promise<Array<Partial<Static<S>>>>;
    async deleteByWhere(where: WhereParam, returnType: RETURN.ORIGIN): Promise<R>;
    async deleteByWhere(where: WhereParam, returnType = RETURN.COUNT): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.delete();
        const WHERE = BUILDER.where(where, ACTION[1].length + 1);
        const result = await this._executeBatch(ACTION, returnType, WHERE);
        return result;
    }


    async deleteByQuery(query: QueryParam, returnType?: RETURN): Promise<number>;
    async deleteByQuery(query: QueryParam, returnType: RETURN.SUCCESS): Promise<boolean>;
    async deleteByQuery(query: QueryParam, returnType: RETURN.COUNT): Promise<number>;
    async deleteByQuery(query: QueryParam, returnType: RETURN.INFO): Promise<Array<Static<S>>>;
    async deleteByQuery(query: QueryParam, returnType: RETURN.KEY): Promise<Array<Partial<Static<S>>>>;
    async deleteByQuery(query: QueryParam, returnType: RETURN.ORIGIN): Promise<R>;
    async deleteByQuery(query: QueryParam, returnType = RETURN.COUNT): Promise<any> {
        const WHERE = this.BUILDER.convertQuery(query);
        const result = await this.deleteByWhere(WHERE, returnType);
        return result;
    }



}



