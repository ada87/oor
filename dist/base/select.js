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
exports.selectAll = exports.selectById = void 0;
const _selectById = (table, id, fields, key = 'id') => {
    let _fields = '*';
    if (fields && fields.length) {
        _fields = fields.join(',');
    }
    return [`SELECT ${_fields} FROM ${table} WHERE ${key} = $1 `, [id]];
};
const selectById = (pg, table, id, fields, key = 'id') => __awaiter(void 0, void 0, void 0, function* () {
    const [SQL, PARAM] = _selectById(table, id, fields, key);
    const result = yield pg.query(SQL, PARAM);
    if (result.rowCount == 1) {
        return result.rows[0];
    }
    return null;
});
exports.selectById = selectById;
const selectAll = (pg, table, fields = '*') => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pg.query(`SELECT ${fields} FROM ${table}`);
    return result.rows;
});
exports.selectAll = selectAll;
