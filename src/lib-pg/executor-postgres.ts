import { RETURN } from '../utils/types'
import { GLOBAL } from './Global';

// import type { Pool, QueryResult } from 'pg';
import type { Options, Sql, PostgresType } from 'postgres';
import type { QueryExecutor, ActionExecutor, } from '../core';


const run  = async <T>(c: Sql, sql: string, params?: Array<any>): Promise<any> => {
    // const users = c(`BEGIN`,params);
    // c.CLOSE
    // c.begin()
    // c.call(sql, params)
    
}