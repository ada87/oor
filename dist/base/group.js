"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = void 0;
const lodash_1 = __importDefault(require("lodash"));
const groupBy = (groupQuery) => {
    let fields = [];
    if (groupQuery.distint) {
        fields.push(`DISTINCT(${groupQuery.filed}}) AS ${groupQuery.filed}`);
    }
    else {
        fields.push(groupQuery.filed);
    }
    if (groupQuery.calc) {
        if (lodash_1.default.isArray(groupQuery.calc)) {
        }
        else {
        }
    }
    else {
        fields.push(`COUNT(${groupQuery.filed} AS total) `);
    }
    // const SQL = `G`
};
exports.groupBy = groupBy;
