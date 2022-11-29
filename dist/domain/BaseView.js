"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseView = void 0;
const lodash_1 = __importDefault(require("lodash"));
const base_1 = require("../base");
const BaseQuery_1 = require("./BaseQuery");
const QueryPagition_1 = require("./QueryPagition");
const QueryWhere_1 = require("./QueryWhere");
const QueryBuilder_1 = require("./QueryBuilder");
const DEFAULT_SCHEMA = 'public';
class BaseView extends BaseQuery_1.BaseQuery {
    constructor(tableName, schema, options) {
        super();
        this._CONFIG = {
            key: 'id',
            order: 'id',
            by: 'desc',
            query_fields: '*',
            pageSize: QueryPagition_1.DEFAULT_PAGE_SIZE,
            FIELD_MAP: new Map(),
            globalCondition: []
        };
        this._QUERY_CACHE = new Map();
        let fields = [];
        this._CONFIG.FIELD_MAP = new Map();
        lodash_1.default.keys(schema.properties).map(field => {
            let properties = schema.properties[field];
            this._CONFIG.FIELD_MAP.set(field, properties);
            if (properties.ignore === false) {
                return;
            }
            if (properties.column) {
                fields.push(`${properties.column} as ${field}`);
            }
            else {
                fields.push(field);
            }
        });
        this._table = DEFAULT_SCHEMA + '.' + tableName;
        this._CONFIG.query_fields = fields.join(',');
        if (options == null)
            return;
        if (options.schema)
            this._table = options.schema + '.' + tableName;
        if (options.key) {
            this._CONFIG.key = options.key;
            this._CONFIG.order = options.key;
        }
        if (options.sortOrder)
            this._CONFIG.order = options.sortOrder;
        if (options.sortBy)
            this._CONFIG.by = options.sortBy;
        if (options.pageSize)
            this._CONFIG.pageSize = options.pageSize;
        if (options.globalCondition && options.globalCondition.length)
            this._CONFIG.globalCondition = options.globalCondition;
    }
    _query(WHERE, PARAM = [], ORDER_BY = '', LIMIT = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const SQL_QUERY = `SELECT ${this._CONFIG.query_fields}  
FROM ${this._table} 
${WHERE} ${ORDER_BY} ${LIMIT}`;
            const queryResult = yield this.sql(SQL_QUERY, PARAM);
            return queryResult.rows;
        });
    }
    /**
     * @see WhereCondition
     * Use a WhereCondition Query Data
    */
    queryByCondition(condition) {
        // TODO check condition
        const [WHERE, PARAM] = (0, QueryWhere_1.whereByCondition)(condition);
        return this._query(WHERE, PARAM);
    }
    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data
    */
    query(query) {
        const { FIELD_MAP, order, by, pageSize } = this._CONFIG;
        const [WHERE, PARAM] = (0, QueryBuilder_1.whereByQuery)(query, FIELD_MAP, this._QUERY_CACHE);
        const [ORDER_BY, LIMIT] = (0, QueryPagition_1.orderByLimit)(FIELD_MAP, query, pageSize, order, by);
        return this._query(WHERE, PARAM, ORDER_BY, LIMIT);
    }
    /**
     * @see QuerySchema
     * Use a QuerySchema Query Data With Page
     * this will return a object with {total:number,list:any[]}
    */
    queryPager(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let total = 0;
            const { key, order, by, pageSize, FIELD_MAP } = this._CONFIG;
            const [WHERE, PARAM] = (0, QueryBuilder_1.whereByQuery)(query, FIELD_MAP, this._QUERY_CACHE);
            if (lodash_1.default.has(query, 'total_') && lodash_1.default.isNumber(query.total_)) {
                total = query.total_;
            }
            else {
                const SQL_COUNT = `SELECT COUNT(${key}) AS total FROM ${this._table} ${WHERE}`;
                const countResult = yield this.sql(SQL_COUNT, PARAM);
                if (countResult.rowCount != 1) {
                    return {
                        total: 0,
                        list: [],
                    };
                }
                total = parseInt(countResult.rows[0].total);
            }
            const [ORDER_BY, LIMIT] = (0, QueryPagition_1.orderByLimit)(FIELD_MAP, query, pageSize, order, by);
            const list = yield this._query(WHERE, PARAM, ORDER_BY, LIMIT);
            return { total, list };
        });
    }
    /**
     * Fetch All Records form the Table / View
    */
    all() {
        return (0, base_1.selectAll)(this.db(), this._table, this._CONFIG.query_fields);
    }
    /**
     * Get A record form Table / View By Specify key.
     * This method will return All column. Even if the IGNORE column.
    */
    getById(id) {
        return (0, base_1.selectById)(this.db(), this._table, id, [], this._CONFIG.key);
    }
}
exports.BaseView = BaseView;
