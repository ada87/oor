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
exports.test = exports.pg = void 0;
const runner_1 = require("@japa/runner");
const pg_1 = require("pg");
exports.pg = new pg_1.Client({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    user: process.env.PG_USER,
    database: process.env.PG_DB,
});
const test = (title, callback) => (0, runner_1.test)(title, callback)
    .setup(() => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.pg.connect();
})).teardown(() => {
    exports.pg.end();
});
exports.test = test;
