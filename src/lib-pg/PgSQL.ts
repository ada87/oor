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

    where(condition: WhereParam, startIdx: number = 1): SQLStatement {
        if (condition == null) return ['', []];
        return where(this.STRICT_QUERY, condition, startIdx)
    }
    fixWhere(statement?: SQLStatement): SQLStatement {
        if (this.GLOBAL_CONDITION == null || this.GLOBAL_CONDITION.length == 0) {
            return statement == null ? ['', []] : statement;
        }
        if (statement == null) {
            return this.where(this.GLOBAL_CONDITION);
        }
        const [WHERE, PARAM] = this.where(this.GLOBAL_CONDITION, statement ? statement[1].length + 1 : 1);
        return [`(${WHERE}) AND (${statement[0]})`, [...statement[1], ...PARAM]]

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