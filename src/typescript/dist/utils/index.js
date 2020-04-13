"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger = __importStar(require("./logger"));
const logger_1 = require("./logger");
exports.Logger = logger_1.Logger;
const uuid_1 = require("uuid");
/**
 * Returns a logger instance
 *
 * @export
 * @param {string} name
 * @returns
 */
function get_logger(name) {
    return logger.make_logger(name);
}
exports.get_logger = get_logger;
function string_contains_any(val, arr) {
    let ret = false;
    for (let i of arr) {
        var res = (val.indexOf(i) > -1);
        ret = ret || res;
    }
    if (ret) {
        return true;
    }
    else {
        return false;
    }
}
let arithmetic_ops = ['+', '-', '/', '*'];
/**
 * Checks if a string has any arithmetic operations in it
 *
 * @export
 * @param {*} text
 * @returns {Boolean}
 */
function has_arithmetic(text) {
    return string_contains_any(text, arithmetic_ops);
}
exports.has_arithmetic = has_arithmetic;
/**
 * Unsafe nodejs evaluation
 *
 * @export
 * @param {string} text
 * @returns {*}
 */
function _eval(text) {
    return eval(text);
}
exports._eval = _eval;
/**
 * Returns last element of an array
 *
 * @export
 * @param {any[]} arg
 * @returns {*}
 */
function last(arg) {
    let len = arg.length;
    return arg[len - 1];
}
exports.last = last;
/**
 * Updates an object at the specified (nested?) path using the specified function. The function will operate on the existing value and the returned value will be set as the new value
 *
 * @export
 * @param {{[k: string] : any}} obj
 * @param {string[]} path
 * @param {(arg: any) => any} fn
 */
function update_in(obj, path, fn) {
    var tmp = obj;
    //traverse the path 
    for (var i = 0; i < path.length - 1; i++) {
        //If the path does not exist we create it 
        if (!tmp[path[i]]) {
            tmp[path[i]] = {};
        }
        //then traverse one level 
        tmp = tmp[path[i]];
    }
    //get the leaf  
    let key = last(path);
    let leaf = tmp[key];
    //operate on the leaf 
    let result = fn(leaf);
    //and then we update the object at that leaf 
    tmp[key] = result;
    //do not return anything (modify object in place)
}
exports.update_in = update_in;
/**
 * Get nested path in an object using path = string[] (if it exists)
 *
 * @export
 * @param {{[k: string] : any}} obj
 * @param {string[]} path
 * @returns {*}
 */
function get_in(obj, path) {
    var tmp = obj;
    //traverse the path (note i range is larger than update_in)
    for (var i = 0; i < path.length; i++) {
        //If the path does not exist we return null  
        if (!tmp[path[i]]) {
            return null;
        }
        //traverse one level 
        tmp = tmp[path[i]];
    }
    return tmp;
}
exports.get_in = get_in;
/**
 * Converts an Object UPDATE TYPE from array form (path with value) to object form (nested object
 * Useful for working with socksync
 *
 * @export
 * @param {array_object_update} array_update
 * @returns {dictionary_object_update}
 */
function array_update_to_object_update(array_update) {
    let { path, value } = array_update;
    var tmp = {};
    //traverse the path 
    for (var i = 0; i < path.length - 1; i++) {
        //build the key 
        tmp[path[i]] = {};
        //then traverse one level 
        tmp = tmp[path[i]];
    }
    //assign the leaf  
    let key = last(path);
    tmp[key] = value;
    //return 
    return tmp;
}
exports.array_update_to_object_update = array_update_to_object_update;
function object_update_to_array_update(obj) {
    var path = [];
    var tmp = obj;
    var done = false;
    while (tmp.constructor == Object) {
        var ks = Object.keys(tmp);
        if (ks.length != 1) {
            //will assume that the current object should be returned 
            break;
        }
        else {
            path.push(ks[0]);
            tmp = tmp[ks[0]];
        }
    }
    return { path, value: tmp };
}
exports.object_update_to_array_update = object_update_to_array_update;
function ms() {
    return new Date().getTime();
}
exports.ms = ms;
function sets_equal(as, bs) {
    if (as.size !== bs.size)
        return false;
    for (var a of as)
        if (!bs.has(a))
            return false;
    return true;
}
exports.sets_equal = sets_equal;
function set(...args) {
    return new Set(args);
}
exports.set = set;
/*

Funcitonal style patterns (inspired by clojure)

*/
/**
 * Parition a list of things into sub lists each of length 'num'
 *
 * @export
 * @template T
 * @param {T[]} thing
 * @param {number} num
 * @returns
 */
function partition(thing, num) {
    var result = [];
    var current_sub_array = [];
    for (var i = 0; i < thing.length; i++) {
        if ((i + 1) % num == 0 && i != 0) {
            current_sub_array.push(thing[i]);
            result.push(current_sub_array);
            current_sub_array = [];
        }
        else {
            current_sub_array.push(thing[i]);
            if (i == thing.length - 1) { //end
                result.push(current_sub_array);
            }
        }
    }
    return result;
}
exports.partition = partition;
function uuid() {
    return uuid_1.v4();
}
exports.uuid = uuid;
/*
 source from: https://gist.github.com/kethinov/6658166
*/
var path = require('path');
var fs = require('fs');
exports.walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach((file) => {
        let name = path.join(dir, file);
        let basename = path.basename(name);
        let prefix = basename.substring(0, 2);
        if (prefix == ".#") {
            return;
        } //ignore the emacs hidden files (threw errors)
        filelist = fs.statSync(name).isDirectory()
            ? exports.walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
    });
    return filelist;
};
function rec_find_dir_ext(dir, ext) {
    return exports.walkSync(dir).filter((file) => (file.substr(-1 * (ext.length + 1)) == '.' + ext));
}
exports.rec_find_dir_ext = rec_find_dir_ext;
/*
STRINGS
*/
function str_empty(s) {
    return s == '';
}
exports.str_empty = str_empty;
function str_not_empty(s) {
    return !str_empty(s);
}
exports.str_not_empty = str_not_empty;
function trim(s) {
    return s.trim();
}
exports.trim = trim;
function char_replacer(c, rep) {
    return function (s) {
        return s.replace(new RegExp(c, 'g'), rep);
    };
}
exports.char_replacer = char_replacer;
function char_remover(c) {
    return char_replacer(c, "");
}
exports.char_remover = char_remover;
//# sourceMappingURL=index.js.map