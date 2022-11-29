"use strict";
// pg 版本
Object.defineProperty(exports, "__esModule", { value: true });
exports.UType = exports.setup = exports.getDB = void 0;
const typebox_1 = require("@sinclair/typebox");
const GLOBAL = {
    provider: null,
    pageSize: 10,
    // err:Error,
    // mode: 'pg',
    // strict: true
};
const getDB = () => {
    if (GLOBAL.provider == null) {
        throw new Error();
    }
    return GLOBAL.provider();
};
exports.getDB = getDB;
const setup = (settings) => {
    if (settings.provider) {
        GLOBAL.provider = settings.provider;
    }
};
exports.setup = setup;
exports.UType = {
    Table: (properties) => typebox_1.Type.Partial(typebox_1.Type.Object(properties)),
    Number: (options) => typebox_1.Type.Number(options),
    String: (options) => typebox_1.Type.String(options),
    Date: (options) => typebox_1.Type.Date(options),
    Boolean: (options) => typebox_1.Type.Boolean(options),
    Integer: (options) => typebox_1.Type.Integer(options),
    // Required: Type.Required
};
