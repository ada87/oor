import { BaseView } from './BaseView';
import { ReturnType } from '../utils/types';

import type { ActionExecutor, ActionBuilder, Table, InsertOptions, UpdateOptions, QueryOptions } from './types'
import type { TObject, Static } from '@sinclair/typebox';
import type { QueryParam, WhereParam, SQLStatement, RowKeyType } from '../utils/types';

export class BaseTable<C, S extends TObject, B extends ActionBuilder, R = any> extends BaseView<C, S, B> implements Table<Static<S>, R> {

    protected EXECUTOR: ActionExecutor<C, Static<S>>;

    protected async _execute(ACTION: SQLStatement, returnType: ReturnType, WHERE?: SQLStatement | false): Promise<any> {
        const { EXECUTOR, BUILDER } = this;
        const RETURNING = BUILDER.returning(returnType);
        let SQL: string, PARAM: any[];
        if (WHERE === false) {  // INSERT
            SQL = `${ACTION[0]}  ${RETURNING}`
            PARAM = ACTION[1];
        } else {        // UPDATE/DELETE
            const RE_WHERE = BUILDER.fixWhere([WHERE ? WHERE[0] : '', WHERE ? [...ACTION[1], ...WHERE[1]] : []]);
            console.log(RE_WHERE)
            SQL = `${ACTION[0]} ${RE_WHERE[0] ? `WHERE ${RE_WHERE[0]}` : ''} ${RETURNING}`
            PARAM = RE_WHERE[1];
        }
        const conn = await this.getConn();
        const result = await EXECUTOR.execute(conn, SQL, PARAM);
        const rtn = EXECUTOR.convert(result, returnType);
        return rtn;
    }

    protected async _executeBatch(ACTION: SQLStatement, returnType: ReturnType, WHERE?: SQLStatement | false) {
        const { EXECUTOR, BUILDER } = this;
        const RETURNING = BUILDER.returning(returnType);
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
        const rtn = EXECUTOR.convertBatch(result, returnType);
        return rtn;
    }

    /**
     * Insert a record
    */
    async insert(data: Static<S>): Promise<Static<S>>;
    async insert(data: Static<S>, returnType: 'SUCCESS', options?: InsertOptions): Promise<boolean>;
    async insert(data: Static<S>, returnType: 'COUNT', options?: InsertOptions): Promise<number>;
    async insert(data: Static<S>, returnType: 'INFO', options?: InsertOptions): Promise<Static<S>>;
    async insert(data: Static<S>, returnType: 'KEY', options?: InsertOptions): Promise<RowKeyType>;
    async insert(data: Static<S>, returnType: 'ORIGIN', options?: InsertOptions): Promise<R>;
    async insert(data: Static<S>, returnType: ReturnType = 'INFO', options?: InsertOptions): Promise<any> {
        const { BUILDER } = this;
        const STATEMENT = BUILDER.insert(data);
        const result = await this._execute(STATEMENT, returnType, false);
        return result as any;
    }

    /**
     * Insert Many record
    */
    async insertBatch(data: Array<Static<S>>): Promise<number>;
    async insertBatch(data: Array<Static<S>>, returnType: 'SUCCESS', options?: InsertOptions): Promise<boolean>;
    async insertBatch(data: Array<Static<S>>, returnType: 'COUNT', options?: InsertOptions): Promise<number>;
    async insertBatch(data: Array<Static<S>>, returnType: 'INFO', options?: InsertOptions): Promise<Array<Static<S>>>;
    async insertBatch(data: Array<Static<S>>, returnType: 'KEY', options?: InsertOptions): Promise<Array<Partial<Static<S>>>>;
    async insertBatch(data: Array<Static<S>>, returnType: 'ORIGIN', options?: InsertOptions): Promise<R>;
    async insertBatch(data: Array<Static<S>>, returnType: ReturnType = 'INFO', options?: InsertOptions): Promise<any> {
        const { BUILDER } = this;
        const STATEMENT = BUILDER.insert(data, options);
        const result = await this._executeBatch(STATEMENT, returnType, false);
        return result;
    }

    /**
     * Update a record (By ID)
    */
    async update(data: Partial<Static<S>>): Promise<boolean>;
    async update(data: Partial<Static<S>>, returnType: 'SUCCESS', options?: UpdateOptions): Promise<boolean>;
    async update(data: Partial<Static<S>>, returnType: 'COUNT', options?: UpdateOptions): Promise<number>;
    async update(data: Partial<Static<S>>, returnType: 'INFO', options?: UpdateOptions): Promise<Static<S>>;
    async update(data: Partial<Static<S>>, returnType: 'KEY', options?: UpdateOptions): Promise<RowKeyType>;
    async update(data: Partial<Static<S>>, returnType: 'ORIGIN', options?: UpdateOptions): Promise<R>;
    async update(data: Partial<Static<S>>, returnType: ReturnType = 'SUCCESS', options?: UpdateOptions): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.update(data, options);
        const WHERE = BUILDER.whereId(data, ACTION[1].length + 1);
        const result = await this._execute(ACTION, returnType, WHERE);
        return result;
    }

    /**
     * Delete a row by primary id
    */
    async deleteById(id: RowKeyType | Partial<Static<S>>): Promise<boolean>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: 'SUCCESS', options?: QueryOptions): Promise<boolean>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: 'COUNT', options?: QueryOptions): Promise<number>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: 'INFO', options?: QueryOptions): Promise<Static<S>>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: 'KEY', options?: QueryOptions): Promise<Partial<Static<S>>>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: 'ORIGIN', options?: QueryOptions): Promise<R>;
    async deleteById(id: RowKeyType | Partial<Static<S>>, returnType: ReturnType = 'SUCCESS', options?: QueryOptions): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.delete();
        const WHERE = BUILDER.whereId(id, ACTION[1].length + 1);
        const result = await this._execute(ACTION, returnType, WHERE);
        return result;
    }

    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>): Promise<number>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: 'SUCCESS', options?: QueryOptions): Promise<boolean>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: 'COUNT', options?: QueryOptions): Promise<number>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: 'INFO', options?: QueryOptions): Promise<Array<Static<S>>>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: 'KEY', options?: QueryOptions): Promise<Array<Partial<Static<S>>>>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: 'ORIGIN', options?: QueryOptions): Promise<R>;
    async deleteByIds(ids: Array<RowKeyType> | Array<Partial<Static<S>>>, returnType: ReturnType = 'COUNT', options?: QueryOptions): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.delete();
        const WHERE = BUILDER.whereId(ids, ACTION[1].length + 1);
        const result = await this._executeBatch(ACTION, returnType, WHERE);
        return result;
    }

    async deleteByField(field: string, value: string | number | boolean): Promise<number>;
    async deleteByField(field: string, value: string | number | boolean, returnType: 'SUCCESS'): Promise<boolean>;
    async deleteByField(field: string, value: string | number | boolean, returnType: 'COUNT'): Promise<number>;
    async deleteByField(field: string, value: string | number | boolean, returnType: 'INFO'): Promise<Array<Static<S>>>;
    async deleteByField(field: string, value: string | number | boolean, returnType: 'KEY'): Promise<Array<Partial<Static<S>>>>;
    async deleteByField(field: string, value: string | number | boolean, returnType: 'ORIGIN'): Promise<R>;
    async deleteByField(field: string, value: string | number | boolean, returnType: ReturnType = 'COUNT'): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.delete();
        const WHERE = BUILDER.byField(field, value, ACTION[1].length + 1);
        const result = await this._executeBatch(ACTION, returnType, WHERE);
        return result;
    }

    async deleteByWhere(where: WhereParam, returnType?: ReturnType): Promise<number>;
    async deleteByWhere(where: WhereParam, returnType: 'SUCCESS'): Promise<boolean>;
    async deleteByWhere(where: WhereParam, returnType: 'COUNT'): Promise<number>;
    async deleteByWhere(where: WhereParam, returnType: 'INFO'): Promise<Array<Static<S>>>;
    async deleteByWhere(where: WhereParam, returnType: 'KEY'): Promise<Array<Partial<Static<S>>>>;
    async deleteByWhere(where: WhereParam, returnType: 'ORIGIN'): Promise<R>;
    async deleteByWhere(where: WhereParam, returnType: ReturnType = 'COUNT'): Promise<any> {
        const { BUILDER } = this;
        const ACTION = BUILDER.delete();
        const WHERE = BUILDER.where(where, ACTION[1].length + 1);
        const result = await this._executeBatch(ACTION, returnType, WHERE);
        return result;
    }

    async deleteByQuery(query: QueryParam): Promise<number>;
    async deleteByQuery(query: QueryParam, returnType: 'SUCCESS'): Promise<boolean>;
    async deleteByQuery(query: QueryParam, returnType: 'COUNT'): Promise<number>;
    async deleteByQuery(query: QueryParam, returnType: 'INFO'): Promise<Array<Static<S>>>;
    async deleteByQuery(query: QueryParam, returnType: 'KEY'): Promise<Array<Partial<Static<S>>>>;
    async deleteByQuery(query: QueryParam, returnType: 'ORIGIN'): Promise<R>;
    async deleteByQuery(query: QueryParam, returnType: ReturnType = 'COUNT'): Promise<any> {
        const WHERE = this.BUILDER.convertQuery(query);
        const result = await this.deleteByWhere(WHERE, returnType);
        return result;
    }
}