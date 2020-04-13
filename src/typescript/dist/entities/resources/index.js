"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const numeric = __importStar(require("./numeric_resource"));
exports.numeric = numeric;
const result = __importStar(require("./result"));
exports.result = result;
const resource = __importStar(require("./resource"));
exports.resource = resource;
exports.get = {
    numeric: function (op) {
        return new numeric.NumericResource(op);
    },
};
//# sourceMappingURL=index.js.map