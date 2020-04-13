"use strict";
//Fri Jul 26 19:36:36 PDT 2019
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
const iu = __importStar(require("./interpreter_utils"));
const rp = __importStar(require("./rule_parser"));
const it = __importStar(require("./interpreter_targets"));
const index_1 = require("../../entities/index");
var log = util.get_logger("ir");
exports.dev_rule_set = [
    { target: () => new index_1.res.result.Result({ value: "hey!" }),
        rules: ["test"] },
    { target: (x) => new index_1.res.result.Result({ value: "You said: " + x.target }),
        rules: ["say [[target]]"] },
    { target: it["store_variable"],
        rules: ["store [[value]] @or(in|into|as) [[name]]",
            "[[name]] equals [[value]]",
            "[[name]] is equal to [[value]]",
            "set [[name]] @or(to|equal to) [[value]]"],
        parsers: { name: iu.nato_parser,
            value: iu.variable_value_parser } },
    { target: it["get_variable"],
        rules: ["what is ?(the value of) [[name]]",
            "output [[name]]"],
        parsers: { name: iu.nato_parser } }
];
function load_rule_set(arg) {
    arg.map(add_to_rule_set);
}
exports.load_rule_set = load_rule_set;
function load_dev_rules() {
    load_rule_set(exports.dev_rule_set);
    log.i(`Total active: ${exports.runtime_rule_set.length}`);
}
exports.load_dev_rules = load_dev_rules;
exports.runtime_rule_set = [];
function add_to_rule_set(obj) {
    let { target, rules, parsers } = obj;
    let regexes = rules.map(rp.parse_rule).flat();
    for (var r = 0; r < regexes.length; r++) {
        exports.runtime_rule_set.push({ regex_info: regexes[r],
            call_info: { target, parsers } });
    }
}
exports.add_to_rule_set = add_to_rule_set;
function build_arguments(opts) {
    let { match_info, regex_info, parsers } = opts;
    log.i("Building argument dictionary:");
    var dic = {};
    var k = null;
    var v = null;
    let order = regex_info.order;
    for (var i = 0; i < order.length; i++) {
        k = order[i];
        v = match_info[1 + i];
        log.i("Adding k,v pair: " + k + "," + v);
        if (parsers && parsers[k]) {
            log.i("Running parser for k: " + k);
            dic[k] = parsers[k](v);
        }
        else {
            dic[k] = iu.variable_value_parser(v); //default to the var val parser 
        }
    }
    log.i("Done.");
    return dic;
}
exports.build_arguments = build_arguments;
function search_rules(text) {
    for (var i = 0; i < exports.runtime_rule_set.length; i++) {
        let { regex_info, call_info } = exports.runtime_rule_set[i];
        var match_info = text.match(regex_info.regex);
        if (match_info) {
            //there was a match 
            log.i("Found rule match: " + regex_info.regex + " for target " + call_info.target);
            let { parsers, target } = call_info;
            return { match_info, regex_info, parsers, target };
        }
        else {
            // skip
        }
    }
    //if we got here there was no match 
    log.i("No rule match for text: " + text);
    return null;
}
exports.search_rules = search_rules;
function build_dispatch(opts) {
    let args = build_arguments(opts);
    let target = opts.target;
    return { args, target };
}
exports.build_dispatch = build_dispatch;
function handle_text(txt) {
    let opts = search_rules(txt);
    if (!opts) {
        log.i("Unrecognized text");
        return null;
    }
    let { args, target } = build_dispatch(opts);
    //make sure it exists 
    if (!target) {
        log.i("Target fn not found: " + target);
        throw ("Target fn not found");
    }
    return target(args);
}
exports.handle_text = handle_text;
//# sourceMappingURL=interpreter_rules.js.map