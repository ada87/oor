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
exports.update = void 0;
const lodash_1 = __importDefault(require("lodash"));
const _updateById = (table, obj, key = 'id') => {
    const fields = lodash_1.default.keys(obj);
    if (fields.length == 0) {
        throw new Error();
    }
    let id = null;
    let query = [];
    let param = [];
    fields.map((field, i) => {
        if (field == key) {
            id = obj[field];
            return;
        }
        let val = obj[field];
        query.push(field + ' = $' + (i + (id ? 0 : 1)));
        param.push(val);
    });
    if (id === null || query.length == 0) {
        throw new Error();
    }
    param.push(id);
    return [`UPDATE  ${table} SET ${query.join(',')} WHERE ${key} = $${query.length + 1}`, param];
};
const update = (pg, table, obj, key = 'id') => __awaiter(void 0, void 0, void 0, function* () {
    const [SQL, PARAM] = _updateById(table, obj, key);
    const result = yield pg.query(SQL, PARAM);
    return result.rowCount;
});
exports.update = update;
