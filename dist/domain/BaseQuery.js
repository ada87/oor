"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseQuery = void 0;
const Util_1 = require("./Util");
class BaseQuery {
    /**
     * Get Database connection form provider
    */
    db() {
        return (0, Util_1.getDB)();
    }
    /**
     * Exec
    */
    sql(sql, params) {
        return this.db().query(sql, params);
    }
}
exports.BaseQuery = BaseQuery;
