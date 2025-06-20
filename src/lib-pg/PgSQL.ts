import { where } from './pgWhere';
import { BaseAction, BaseError, ERROR_CODE } from '../core';
import { RESERVED_WORDS } from './RESERVED_WORDS';;

import type { SQLStatement, WhereParam } from '../utils/types';


export class PgQuery extends BaseAction {


    protected placeholder(i: number): string {
        return '$' + i;
    }
    protected initReservedWord() {
        return RESERVED_WORDS;
    }


    byField(field: string, value: string | number | boolean, startIdx: number = 1): SQLStatement {
        if (!this.F2W.has(field)) throw new BaseError(ERROR_CODE.COLUMN_NOT_FOUND, { message: `Field ${field} not found in Table ${this.tableName}` });
        let column = this.F2W.get(field);
        let sql = `${column} = ${this.placeholder(startIdx)}`;
        return [sql, [value]];
    }

    wrapField(filed: string): string {
        return '"' + filed + '"';
    }

    where(condition: WhereParam, startIdx: number = 1): SQLStatement {
        if (condition == null) return ['', []];
        return where(this.STRICT_QUERY, condition, startIdx)
    }

    fixWhere(statement?: SQLStatement): SQLStatement {
        if (this.GLOBAL_CONDITION == null || this.GLOBAL_CONDITION.length == 0) return statement == null ? ['', []] : statement;
        if (statement == null) return this.where(this.GLOBAL_CONDITION);
        const [WHERE, PARAM] = this.where(this.GLOBAL_CONDITION, statement ? statement[1].length + 1 : 1);
        if (WHERE.length) {
            if (statement[0].length) {
                return [`(${WHERE}) AND (${statement[0]})`, [...statement[1], ...PARAM]]
            }
            return [WHERE, PARAM];
        }
        return statement == null ? ['', []] : statement;

    }

}