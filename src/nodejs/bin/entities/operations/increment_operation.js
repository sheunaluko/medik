"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const numeric_operation_js_1 = require("./numeric_operation.js");
class IncrementOperation extends numeric_operation_js_1.NumericOperation {
    constructor({ value }) {
        let id = "increment_operation";
        let fn = function (val) {
            return val + Number(value);
        };
        super({ id, fn });
    }
}
exports.IncrementOperation = IncrementOperation;
//# sourceMappingURL=increment_operation.js.map