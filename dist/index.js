"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UType = exports.setup = exports.BaseView = exports.BaseTable = void 0;
var BaseTable_1 = require("./domain/BaseTable");
Object.defineProperty(exports, "BaseTable", { enumerable: true, get: function () { return BaseTable_1.BaseTable; } });
var BaseView_1 = require("./domain/BaseView");
Object.defineProperty(exports, "BaseView", { enumerable: true, get: function () { return BaseView_1.BaseView; } });
var Util_1 = require("./domain/Util");
Object.defineProperty(exports, "setup", { enumerable: true, get: function () { return Util_1.setup; } });
Object.defineProperty(exports, "UType", { enumerable: true, get: function () { return Util_1.UType; } });
__exportStar(require("./domain/types"), exports);
