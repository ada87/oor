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
exports.insert = void 0;
const lodash_1 = __importDefault(require("lodash"));
const _insert = (table, obj) => {
    const fields = lodash_1.default.keys(obj);
    if (fields.length == 0) {
        throw new Error();
    }
    let query = [];
    let idx = [];
    let param = [];
    fields.map((field, i) => {
        let val = obj[field];
        if (val === null) {
            return;
        }
        query.push(field);
        idx.push("$" + (i + 1));
        param.push(val);
    });
    return [`INSERT INTO ${table} (${query.join(',')}) VALUES (${idx.join(',')}) RETURNING *`, param];
};
const insert = (pg, table, obj) => __awaiter(void 0, void 0, void 0, function* () {
    const [SQL, PARAM] = _insert(table, obj);
    const result = yield pg.query(SQL, PARAM);
    if (result.rowCount == 1) {
        return result.rows[0];
    }
    throw new Error();
});
exports.insert = insert;
// export const insertBatch = async (pg: ClientBase, table: string, obj: any[]) => {
// }
