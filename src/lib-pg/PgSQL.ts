import { where, fixWhere } from './pgWhere';
import { BaseQuery, BaseAction } from '../core';
import { RESERVED_WORDS, FIELDS_MAP } from './RESERVED_WORDS';;

import type { SQLStatement, WhereParam } from '../utils/types';


export class PgQuery extends BaseQuery {

    protected initReservedWord() {
        return RESERVED_WORDS;
    }

    wrapField(filed: string): string {
        return '"' + filed + '"';
    }

    where(condition: WhereParam, startIdx?: number): SQLStatement {
        if (condition == null) return ['', []];
        return where(this.STRICT_QUERY, condition, startIdx)
    }
    fixWhere(statement?: SQLStatement): SQLStatement {
        return statement;
    }





}
// COLUMN_MAP: Map<string, Column>, extra: WhereItem[]
// abstract class 

export class PgAction extends PgQuery implements BaseAction {
    // init() {
    //     // console.log('inti')
    //     return [null, null]  as any
    // } 
    protected checkEntity(obj: any, isAdd?: boolean) {
        throw new Error('Method not implemented.');
    }
    // insert: (data: TObject, PgQuery?: boolean) => [string, any[]];
    // update: (data: TObject, returning?: boolean) => [string, any[]];
    // delete: () => string;

}