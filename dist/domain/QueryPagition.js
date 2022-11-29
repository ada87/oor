"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderByLimit = exports.DEFAULT_PAGE_SIZE = void 0;
const lodash_1 = __importDefault(require("lodash"));
exports.DEFAULT_PAGE_SIZE = 10;
const BY_SET = new Set(['asc', 'desc']);
const orderBy = (fieldSet, query, default_order = 'id', default_by = 'desc') => {
    if (!lodash_1.default.has(query, 'order_')) {
        if (fieldSet.has(default_order)) {
            return `ORDER BY ${default_order} ${default_by}`;
        }
        return '';
    }
    if (fieldSet.has(query.order_)) {
        let by = query.by_ || default_by;
        if (lodash_1.default.has(query, 'by_') && BY_SET.has(query.by_)) {
            by = query.by_;
        }
        else {
            by = default_by;
        }
        return `ORDER BY ${query.order_} ${query.by}`;
    }
    return '';
};
const limit = (query, pageSize = exports.DEFAULT_PAGE_SIZE) => {
    let start = lodash_1.default.has(query, 'start_') ? query.start_ : 0;
    let count = lodash_1.default.has(query, 'count_') ? query.count_ : pageSize;
    return `LIMIT ${count} OFFSET ${start}`;
};
const orderByLimit = (fieldSet, query, pageSize = exports.DEFAULT_PAGE_SIZE, default_order = 'id', default_by = 'desc') => [
    orderBy(fieldSet, query, default_order, default_by), limit(query, pageSize)
];
exports.orderByLimit = orderByLimit;
