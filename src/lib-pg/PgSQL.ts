import _ from 'lodash';
import { BaseQuery, BaseAction } from '../core';

import { SQLStatement, WhereParam } from '../utils/types';
import type { TObject } from '@sinclair/typebox';



export class PgQuery extends BaseQuery {
    where: (condition: WhereParam, startIdx?: number) => SQLStatement;
    fixWhere: (statement?: SQLStatement) => SQLStatement;


    


}
// abstract class 

export class PgAction extends PgQuery implements BaseAction {
    protected checkEntity(obj: any, isAdd?: boolean) {
        throw new Error('Method not implemented.');
    }
    // insert: (data: TObject, PgQuery?: boolean) => [string, any[]];
    // update: (data: TObject, returning?: boolean) => [string, any[]];
    // delete: () => string;

}