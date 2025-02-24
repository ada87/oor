// export const queryToCondition = (strict: boolean, query: QuerySchema, COLUMN_MAP: Map<string, Column>, FIELD_CACHE: Map<string, WhereDefine>): WhereCondition => {
//     const err: string[] = [];
//     const ROOT: WhereCondition = { link: 'AND', items: [] }
//     _.keys(query).map(key => {
//         let define: WhereDefine = null;
//         if (FIELD_CACHE.has(key)) {
//             define = FIELD_CACHE.get(key);
//             if (define == null) return; // ignore default and error condition
//         } else if (DEFAULT_QUERY_KEY.has(key)) {
//             FIELD_CACHE.set(key, null);
//             return;
//         };
//         if (define == null) {
//             define = fieldToDef(key, COLUMN_MAP);
//         }
//         FIELD_CACHE.set(key, define);
//         if (define == null) {
//             err.push(key)
//             return
//         };
//         // @ts-ignore
//         let queryItem = defineToItem(define, COLUMN_MAP.get(define.column || define.field), query[key])
//         if (queryItem == null) {
//             err.push(key + ' \' value has problem : ' + String(query[key]))
//             return;
//         }
//         ROOT.items.push(queryItem);
//     });
//     // let keyword = _.trim(query.keyword_);
//     // if (keyword) {
//     //     let OR: WhereCondition = { link: 'OR', items: [] }
//     //     for (let [key, value] of COLUMN_MAP) {
//     //         if (value.ignore) continue;
//     //         let type = getFieldType(value);
//     //         if (type != 'string') continue;
//     //         OR.items.push({ column: value.column || key, value: keyword, fn: 'Like' });
//     //     }
//     //     if (OR.items.length) {
//     //         if (OR.items.length == 1) {
//     //             ROOT.items.push(OR.items[0])
//     //         } else { 
//     //             ROOT.items.push(OR)
//     //         }
//     //     }
//     // }
//     throwErr(strict, err, 'Some SQL Error Occur')
//     return ROOT;
// }



// private orderByLimit(query?: QuerySchema): OrderByLimit {
//     const { _CONFIG: { sort, pageSize, } } = this;
//     let orderBy: OrderByLimit = {}
//     if (query == null) {
//         orderBy.from = 0;
//         orderBy.size = pageSize;
//         if (sort) orderBy.sort = sort;
//         return orderBy
//     }
//     orderBy.from = query.start_ || 0;
//     orderBy.size = query.count_ || pageSize;
//     if (this._F2C.has(query.order_)) {
//         orderBy.sort = { [this._F2C.get(query.order_)]: _.trim(query.by_) == 'asc' ? 'asc' : 'desc' }
//     }
//     return orderBy

// }


    // byId(value: string | number):SQLStatement {
    //     return [ 
    //         `${this.rowKey} = $1`, 
    //         [value]
    //     ] 
    // }

    // fixWhere: (where?: string, param?: Array<any>)


    // where(condition: WhereParam, startIdx: number = 0):SQLStatement {
    //     let whereClause = '';
    //     const params: any[] = [];
    //     let idx = startIdx;

    //     for (const [field, value] of Object.entries(condition)) {
    //         if (whereClause.length > 0) {
    //             whereClause += ' AND ';
    //         }
    //         whereClause += `${field} = $${idx}`;
    //         params.push(value);
    //         idx++;
    //     }

    //     return [whereClause, params];
    // }
    // byField(field: string, value: string | number | boolean, startIdx?: number):SQLStatement{

    //     return [
    //         `${field} = $${startIdx}`,
    //         [value]
    //     ]
    // }


    // count(): string {
    //     return '';
    // }


    // // where(query: QuerySchema): string {
    // //     return '';
    // // }
    // // byId(id: string | number): string {
    // //     return ''
    // // }
    // // byField(field: string, value: string | number | boolean | Date): string {
    // //     return '';
    // // }
    // orderBy(): string {
    //     return '';
    // }
    // limit(): string {
    //     return '';
    // }





    // /** 
    //  * _BUILDER: SqlBuilder  - SQL Query Builder for db
    // *   @see SqlBuilder
    // */
    // protected abstract _BUILDER: SqlQuery<S, C>;

    // /** 
    // * _EXECUTOR: BaseSqlExecutor  - SQL Executer for db
    // *      @see BaseSqlExecutor
    // */
    // protected abstract _EXECUTOR: BaseSqlExecutor<Static<S>>;



    // protected _QUERY_CACHE = new Map<string, WhereDefine>();

    // /**
    //  * @param tableName Data table name, "${schemaName}.${tableName}"  
    //  *  "${schemaName}." can be ignore with the default search_path.
    //  * @param schema The Object Schema, oor will not validate the value
    //  * @param options (Table/View) Options
    //  * 
    // */
    // constructor(db: Database<C>, tableName: string, schema: S, options?: TableOptions) {
    //     super(db);
    //     this._table = tableName;

    // };


    // protected abstract init(schema: S, options?: TableOptions): void;

    // private async _query(WHERE, PARAM: ArrayLike<string> = [], ORDER_BY = '', LIMIT = ''): Promise<Static<S>[]> {
    //     const { _BUILDER, _EXECUTOR, _table, _CONFIG: { fields_query } } = this;
    //     const SQL_QUERY = _BUILDER.select(_table, fields_query);
    //     const SQL = `${SQL_QUERY} ${WHERE} ${ORDER_BY} ${LIMIT}`;
    //     const conn = await this.getConn();
    //     const result = _EXECUTOR.query(conn, SQL, PARAM)
    //     return result;
    // }




    // /**
    //  * Get records form Table / View By Specify Property = value.
    // */
    // async queryByField(field: string, value?: string | number | boolean): Promise<Static<S>[]> {
    //     const { _table, _BUILDER, _EXECUTOR, _CONFIG: { fields_get } } = this;
    //     const SQL = _BUILDER.select(_table, fields_get);
    //     const [WHERE, PARAM] = _BUILDER.byField(field, value);
    //     const conn = await this.getConn()
    //     return _EXECUTOR.query(conn, `${SQL} ${this.fixWhere(WHERE)}`, PARAM);
    // }

    // protected fixWhere(where: string): string {
    //     const { _CONFIG: { WHERE_FIX } } = this;
    //     let whereStr = _.trim(where);
    //     return whereStr.length ? (WHERE_FIX[0] + WHERE_FIX[1] + whereStr) : WHERE_FIX[0];
    // }

    // private orderByLimit(query?: QuerySchema): [string, string] {
    //     const { _C2F, _F2C, _CONFIG: { sort, pageSize } } = this;
    //     return [
    //         // _BUILDER.orderBy(_F2C, _C2F, query, sort),
    //         // _BUILDER.limit(query, pageSize)
    //     ]
    // }




    // byId: (value: string | number) => string;
// }





// export const count: SqlCount = (table: string) => `SELECT count(0) AS total FROM ${table}`;

// export const insert: SqlInsert = (table: string, obj: any): [string, any[]] => {
//     const fields = _.keys(obj);
//     if (fields.length == 0) {
//         throw new Error();
//     }
//     let query = [];
//     let idx = [];
//     let param = [];

//     fields.map((field, i) => {
//         let val = obj[field];
//         if (val === null) {
//             return
//         }
//         query.push(field)
//         idx.push("$" + (i + 1));
//         param.push(val)
//     })
//     return [`INSERT INTO ${table} (${query.join(',')}) VALUES (${idx.join(',')}) RETURNING *`, param];
// }

// export const update: SqlUpdate = (table: string, obj: any, key = 'id'): [string, any[]] => {

// }

// export const del: SqlDelete = (table: string): string => `DELETE FROM ${table} `





// export const byField: SqlByField = (field: string, id: string | number, startIdx: number = 1) => [` ${field} = $${startIdx} `, [id]];
