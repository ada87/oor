import { QuerySchema, WhereDefine, FieldType, USchema } from './types';
export declare const getFieldType: (schema: any) => FieldType;
/**
 * @see QuerySchema
 * Build Query Where By QuerySchema
*/
export declare const whereByQuery: (query: QuerySchema, FIELD_MAP: Map<string, USchema>, FIELD_CACHE: Map<string, WhereDefine>, startIdx?: number) => [string, any[]];
