"use strict";
//Fri Jul 26 18:41:47 PDT 2019
//modified for ts Sun Mar  1 11:59:31 PST 2020 
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nato_1 = require("./nato");
const util = __importStar(require("../../utils"));
var log = util.get_logger("iu");
function tokenized_dictionary_replacer(opts) {
    let { text, dictionary, splitter, joiner } = opts;
    //define the mapper function 
    let mapper = function (token) {
        if (dictionary[token]) {
            return dictionary[token];
        }
        else {
            return token;
        }
    };
    //map fn accross tokens and join them 
    return text.split(splitter).map(mapper).join(joiner);
}
exports.tokenized_dictionary_replacer = tokenized_dictionary_replacer;
function nato_parser(text) {
    return tokenized_dictionary_replacer({ text: text,
        dictionary: nato_1.nato,
        splitter: " ",
        joiner: "" });
}
exports.nato_parser = nato_parser;
function variable_value_parser(text) {
    //determines the appropriate parser and dispatches it 
    if (util.has_arithmetic(text)) {
        log.i("Value is arithmatic expression");
        var result = numerical_expression_parser(text);
    }
    else {
        log.i("Value is string");
        result = text;
    }
    return result;
}
exports.variable_value_parser = variable_value_parser;
function numerical_expression_parser(text) {
    let result = util._eval(text);
    return result;
}
exports.numerical_expression_parser = numerical_expression_parser;
//# sourceMappingURL=interpreter_utils.js.map