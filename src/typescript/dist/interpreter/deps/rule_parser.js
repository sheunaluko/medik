"use strict";
//Sun Mar  3 14:50:48 PST 2019 
//modified for ts Sun Mar  1 11:59:31 PST 2020 
Object.defineProperty(exports, "__esModule", { value: true });
// must support queries of this kind => 
let r1 = "remind me to [[message-on-alarm]] in [[minutes-till-alarm]] minutes ?(from now|please)";
exports.var_regex = /\[\[(.+?)\]\]/;
exports.opt_regex = /\?\((.+?)\)/; //optional includes empty string
exports.OR_regex = /@or\((.+?)\)/; //OR       does not include empty string  
/*
    A set of recursive functions for parsing higher level commands into regexes
*/
function process_vars(rule, order) {
    let result = rule.match(exports.var_regex);
    if (result) {
        order.push(result[1]);
        return process_vars(rule.replace(exports.var_regex, "(.+?)"), order);
    }
    else {
        return { regex: "^" + rule + "$", order: order };
    }
}
exports.process_vars = process_vars;
function process_optionals(rule) {
    let matches = rule.match(exports.opt_regex);
    //console.log(matches)
    if (matches) {
        let optionals = matches[1].split("|").concat([""]); //add the empty string as well 
        return optionals.map(function (opt) {
            let next = rule.replace(exports.opt_regex, opt);
            //console.log(next)
            //replace the optional in recursive fashion
            return process_optionals(next);
        }).flat();
    }
    else {
        //normalize the spaces between tokens and trim 
        //necessary because of the way optionals are processed
        // for example with "foo ?(blah) bar" you end up with => "foo  bar" | "foo blah bar"
        return [rule.replace(/\s+/g, " ").trim()];
    }
}
exports.process_optionals = process_optionals;
function process_ORs(rule) {
    let matches = rule.match(exports.OR_regex);
    //console.log(matches)
    if (matches) {
        let ORS = matches[1].split("|");
        return ORS.map(function (OR) {
            let next = rule.replace(exports.OR_regex, OR);
            return process_ORs(next);
        }).flat();
    }
    else {
        //normalize the spaces between tokens and trim 
        // for example with "foo ?(blah) bar" you end up with => "foo  bar" | "foo blah bar"
        return [rule.replace(/\s+/g, " ").trim()];
    }
}
exports.process_ORs = process_ORs;
/**
 * Takes a higher order rule and then parses it into an array of sever "RegexInstance" types,
 * which track a regex with capture groups and variables that should be assigned to by each capture,
 * in order
 *
 * @export
 * @param {string} rule
 * @returns {RegexInstance[]}
 */
function parse_rule(rule) {
    return process_optionals(rule).map(process_ORs).flat().map(x => process_vars(x, []));
}
exports.parse_rule = parse_rule;
// must support queries of this kind => 
//let r1 =  "remind me to [[message-on-alarm]] in [[minutes-till-alarm]] minutes ?(from now|please)"  
/*
   TO UNDERSTAND USAGE:
   
   parse_rule(r1)  PRODUCES THE FOLLOWING:
   
   [ { regex: '^remind me to (.+?) in (.+?) minutes from now$',
       order: [ 'message-on-alarm', 'minutes-till-alarm' ] },
     { regex: '^remind me to (.+?) in (.+?) minutes please$',
       order: [ 'message-on-alarm', 'minutes-till-alarm' ] },
     { regex: '^remind me to (.+?) in (.+?) minutes$',
       order: [ 'message-on-alarm', 'minutes-till-alarm' ] } ]
       
*/
//# sourceMappingURL=rule_parser.js.map