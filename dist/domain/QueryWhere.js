"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whereByCondition = void 0;
const lodash_1 = __importDefault(require("lodash"));
const ItemToWhere = (item, pos) => {
    if (item.fn) {
    }
    switch (item.operation) {
        case '<':
        case '<=':
        case '>':
        case '>=':
        case '=':
            pos.SQL.push(`${item.field} ${item.operation} $${pos.NUM}`);
            pos.PARAM.push(item.value);
            pos.NUM++;
            break;
        case 'LIKE':
            pos.SQL.push(`${item.field} LIKE '%$${pos.NUM}%'`);
            pos.PARAM.push(item.value);
            pos.NUM++;
            break;
        default:
            // pos.SQL.push(`${item.field} = $${pos.NUM}`);
            // pos.PARAM.push(item.value)
            // pos.NUM++;
            break;
    }
};
const ConditionToWhere = (condition, pos) => {
    for (let group of condition.items) {
        if (lodash_1.default.has(group, 'link')) {
            let _pos = {
                SQL: [],
                PARAM: [],
                NUM: pos.NUM
            };
            ConditionToWhere(group, _pos);
            if (_pos.NUM > pos.NUM) {
                pos.NUM = _pos.NUM;
                for (let param of _pos.PARAM) {
                    pos.PARAM.push(param);
                }
                //@ts-ignore;
                pos.SQL.push('(' + _pos.SQL.join(' ' + group.link + ' ') + ')');
            }
        }
        else {
            ItemToWhere(group, pos);
        }
    }
};
const whereByCondition = (condition, startIdx = 1) => {
    const pos = {
        SQL: [],
        PARAM: [],
        NUM: startIdx
    };
    let root = lodash_1.default.isArray(condition) ? { link: 'AND', items: condition } : condition;
    ConditionToWhere(root, pos);
    if (pos.PARAM.length > 0) {
        return ['WHERE ' + pos.SQL.join(" " + root.link + " "), pos.PARAM];
    }
    return ['', []];
};
exports.whereByCondition = whereByCondition;
