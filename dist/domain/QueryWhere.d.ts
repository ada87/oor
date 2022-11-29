import { WhereItem, WhereCondition } from './types';
export declare const whereByCondition: (condition: (WhereCondition) | (WhereItem[]), startIdx?: number) => [string, any[]];
