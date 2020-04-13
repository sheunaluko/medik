"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_operation_1 = require("./array_operation");
exports.ArrayOperation = array_operation_1.ArrayOperation;
const increment_operation_1 = require("./increment_operation");
exports.IncrementOperation = increment_operation_1.IncrementOperation;
const numeric_operation_1 = require("./numeric_operation");
exports.NumericOperation = numeric_operation_1.NumericOperation;
const operation_1 = require("./operation");
exports.Operation = operation_1.Operation;
function _array({ fn }) {
    return new array_operation_1.ArrayOperation({ fn });
}
var first_array = () => _array({ fn: (x) => x[0] });
var last_array = () => _array({ fn: (x) => x[x.length - 1] });
function numeric({ fn }) {
    return new numeric_operation_1.NumericOperation({ fn });
}
function incrementor({ value }) {
    return new increment_operation_1.IncrementOperation({ value });
}
var get = {
    array: {
        first: first_array,
        last: last_array,
        generic: _array,
    },
    numeric,
    incrementor,
};
exports.get = get;
//# sourceMappingURL=index.js.map