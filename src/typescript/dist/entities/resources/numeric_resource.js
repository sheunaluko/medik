"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const res = __importStar(require("./resource"));
const types = __importStar(require("../types"));
class NumericResource extends res.Resource {
    constructor(ops) {
        ops.value = Number(ops.value); //convert to number  !
        var entity_id = `numeric_res::${ops.value}`;
        // - init object 
        super({ entity_id });
        //define the type handlers
        this.set_type_handler(types.core.float, function () {
            return ops.value;
        });
        this.value = ops.value;
        //define default type 
        this.default_type = types.core.float;
    }
}
exports.NumericResource = NumericResource;
//# sourceMappingURL=numeric_resource.js.map