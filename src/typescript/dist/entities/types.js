"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//define CORE types as enum
var core;
(function (core) {
    core[core["string"] = 0] = "string";
    core[core["array"] = 1] = "array";
    core[core["dictionary"] = 2] = "dictionary";
    core[core["float"] = 3] = "float";
    core[core["resource"] = 4] = "resource";
    core[core["operation"] = 5] = "operation";
    core[core["action"] = 6] = "action";
    core[core["argument"] = 7] = "argument";
    core[core["result"] = 8] = "result";
})(core = exports.core || (exports.core = {}));
function js_type(x) {
    switch (x.constructor) {
        case String:
            return core.string;
            break;
        case Array:
            return core.array;
            break;
        case Object:
            return core.dictionary;
            break;
        case Number:
            return core.float;
            break;
    }
    return null;
}
exports.js_type = js_type;
//# sourceMappingURL=types.js.map