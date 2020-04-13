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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const types = __importStar(require("../types.js"));
const operation_js_1 = require("./operation.js");
class NumericOperation extends operation_js_1.Operation {
    constructor({ fn, id }) {
        let entity_id = id || "numeric_op";
        if (!fn) {
            throw ("Please provide fn");
        }
        super({ entity_id });
        this.fn = fn;
    }
    run({ resources, resource }) {
        return __awaiter(this, void 0, void 0, function* () {
            //this operation is performed on some resource 
            //it will default to retrieving the resource as types.float
            //defaults to only acept 1 arg 
            if (!resource) {
                resource = resources[0];
            }
            try {
                let type = types.core.float;
                this.log.d("Requesting float type");
                let result = yield resource.as({ type });
                this.log.d("Got resource as: ");
                this.log.d(result);
                let res_type = types.js_type(result);
                this.log.d(`Type of result = ${res_type}`);
                this.log.d("Running fn:");
                let value = this.fn(result);
                this.log.d(`Got value: ${value}`);
                return value;
            }
            catch (e) {
                this.catch_error(e);
            }
        });
    }
}
exports.NumericOperation = NumericOperation;
//# sourceMappingURL=numeric_operation.js.map