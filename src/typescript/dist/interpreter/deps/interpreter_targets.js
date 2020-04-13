"use strict";
//Fri Jul 26 21:59:21 PDT 2019
//modified for ts Sun Mar  1 11:59:31 PST 2020 
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../../utils"));
var log = util.get_logger("it");
var mem = {};
/*
 TODO :
 1) actually build memory / service architecture
 2) Create more interpreter targets here
        - don't forget about entities too...
*/
function store_variable(opts) {
    log.i("Received store request");
    let { name, value } = opts;
    mem[name] = value;
    let msg = "Stored value into memory field " + name + " :";
    log.i(msg);
    log.i(value);
}
exports.store_variable = store_variable;
function get_variable(opts) {
    log.i("Received get request for: " + opts.name);
    let value = mem[opts.name];
    log.i(value);
}
exports.get_variable = get_variable;
//# sourceMappingURL=interpreter_targets.js.map