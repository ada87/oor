import type { QuerySchema } from './types';
export declare const DEFAULT_PAGE_SIZE = 10;
export declare const orderByLimit: (fieldSet: Map<string, any>, query?: QuerySchema, pageSize?: number, default_order?: string, default_by?: string) => [string, string];
