"use strict";
//Fri Jul 26 18:36:38 PDT 2019
//modified for ts Sun Mar  1 11:59:31 PST 2020 
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ir = __importStar(require("./deps/interpreter_rules"));
exports.ir = ir;
const it = __importStar(require("./deps/interpreter_targets"));
exports.it = it;
const iu = __importStar(require("./deps/interpreter_utils"));
exports.iu = iu;
/**
 * Parse a text string
 *
 * @param {string} text
 * @returns
 */
function parse(text) {
    return ir.handle_text(text);
}
exports.parse = parse;
/**
 * Loads an array of rules for the interpreter. These rules map text to entities
 *
 * @export
 * @param {TextEntityMapping[]} arg
 */
function load_rules(arg) {
    ir.load_rule_set(arg);
}
exports.load_rules = load_rules;
/**
 * Loads the dev set of rule definitions
 *
 * @export
 */
function dev_rules() {
    ir.load_dev_rules();
}
exports.dev_rules = dev_rules;
//# sourceMappingURL=index.js.map