import { where } from './sqliteWhere';
import { BaseAction } from '../core';
import { RESERVED_WORDS } from './RESERVED_WORDS';;

import type { SQLStatement, WhereParam } from '../utils/types';


export class SqliteQuery extends BaseAction {


    protected initReservedWord() {
        return RESERVED_WORDS;
    }

    wrapField(filed: string): string {
        return '"' + filed + '"';
    }

    where(condition: WhereParam): SQLStatement {
        if (condition == null) return ['', []];
        return where(this.STRICT_QUERY, condition)
    }


    byField(field: string, value: string | number | boolean): SQLStatement {
        if (!this.F2W.has(field)) throw new Error(`Field ${field} not found in Table ${this.tableName}`);
        let column = this.F2W.get(field);
        let sql = `${column} = ?`;
        return [sql, [value]];
    }

    fixWhere(statement?: SQLStatement): SQLStatement {
        if (this.GLOBAL_CONDITION == null || this.GLOBAL_CONDITION.length == 0) return statement == null ? ['', []] : statement;
        if (statement == null) return this.where(this.GLOBAL_CONDITION);
        const [WHERE, PARAM] = this.where(this.GLOBAL_CONDITION);
        return [`(${WHERE}) AND (${statement[0]})`, [...PARAM, ...statement[1]]]
    }

}