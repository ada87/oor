"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTable = void 0;
const lodash_1 = __importDefault(require("lodash"));
const base_1 = require("../base");
const BaseView_1 = require("./BaseView");
const QueryBuilder_1 = require("./QueryBuilder");
class BaseTable extends BaseView_1.BaseView {
    /**
     * check row data while insert or update
     * and auto warp the data
     * */
    checkEntity(obj, isAdd = false) {
        let clone = {};
        this._CONFIG.FIELD_MAP.forEach((schema, key) => {
            let field = schema.column || key;
            if (lodash_1.default.has(obj, key)) {
                clone[field] = obj[key];
            }
            let type = (0, QueryBuilder_1.getFieldType)(schema);
            if (type == 'date') {
                if (schema.isCreate) {
                    if (isAdd) {
                        clone[field] = new Date();
                    }
                    else {
                        lodash_1.default.unset(clone, field);
                    }
                    return;
                }
                if (schema.isModify) {
                    clone[field] = new Date();
                    return;
                }
            }
        });
        return clone;
    }
    deleteById(id) {
        return (0, base_1.deleteById)(this.db(), this._table, id, this._CONFIG.key);
    }
    update(object) {
        let entity = this.checkEntity(object, false);
        return (0, base_1.update)(this.db(), this._table, entity, this._CONFIG.key);
    }
    insert(object) {
        let entity = this.checkEntity(object, true);
        return (0, base_1.insert)(this.db(), this._table, entity);
    }
}
exports.BaseTable = BaseTable;
