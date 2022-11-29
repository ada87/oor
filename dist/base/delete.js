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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = void 0;
const _deleteById = (table, id, key) => {
    return [`DELETE FROM ${table} WHERE ${key} = $1 `, [id]];
};
const deleteById = (pg, table, id, key = 'id') => __awaiter(void 0, void 0, void 0, function* () {
    const [SQL, PARAM] = _deleteById(table, id, key);
    const result = yield pg.query(SQL, PARAM);
    return result.rowCount;
});
exports.deleteById = deleteById;
