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
const types = __importStar(require("../types"));
const operation_1 = require("./operation");
class ArrayOperation extends operation_1.Operation {
    constructor({ fn, id = "array_operation" }) {
        let entity_id = id;
        if (!fn) {
            throw "Please provide fn";
        }
        super({ entity_id });
        this.fn = fn;
    }
    run({ resources, resource }) {
        return __awaiter(this, void 0, void 0, function* () {
            //this operation is performed on some resource
            //it will default to retrieving the resource as an array
            //defaults to only acept 1 arg
            if (!resource) {
                resource = resources[0];
            }
            try {
                let type = types.core.array;
                let result = yield resource.as({ type });
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
exports.ArrayOperation = ArrayOperation;
//# sourceMappingURL=array_operation.js.map