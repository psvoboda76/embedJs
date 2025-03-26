"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepLog = deepLog;
const tslib_1 = require("tslib");
const util_1 = tslib_1.__importDefault(require("util"));
function deepLog(obj) {
    console.log(util_1.default.inspect(obj, { depth: null, colors: true, sorted: true, compact: false }));
}
//# sourceMappingURL=log.js.map