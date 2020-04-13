"use strict";
// Thu Apr 02 20:25:50 2020 
// - utilities for parsing medik files
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../../utils/index"));
const fs = __importStar(require("fs"));
exports.medik_knowledge_src_directory = "/Users/oluwa/dev/vcs/src/nodejs/typescript/src/medik/knowledge_src/";
function get_medik_files() {
    return util.rec_find_dir_ext(exports.medik_knowledge_src_directory, "medik");
}
exports.get_medik_files = get_medik_files;
function get_file_chunks(fname) {
    let strang = fs.readFileSync(fname, "utf-8");
    return strang.split(/[\r\n][\r\n][\r\n]*/).map((x) => x.trim()).filter((x) => (x != ""));
}
exports.get_file_chunks = get_file_chunks;
function starts_ends_with(s, start, end) {
    return (s[0] == start && s[s.length - 1] == end);
}
exports.starts_ends_with = starts_ends_with;
exports.is_array = (s) => starts_ends_with(s, "[", "]");
exports.is_concept = (s) => starts_ends_with(s, "<", ">");
exports.is_expression = (s) => starts_ends_with(s, "'", "'");
function get_targets(text) {
    //only look at first line for this 
    let lines = text.split("@");
    let tmp = lines[0].split(":");
    let edge_type = tmp[0].trim();
    let target = tmp[1].trim();
    //console.log(target )
    //-- now we get the targets
    if (exports.is_array(target)) {
        var target_strings = target.match(/<.*>/)[0].split(/,/);
    }
    else if (exports.is_concept(target)) {
        var target_strings = [target];
    }
    else {
        throw ("unrecognized target " + target);
    }
    //console.log(target_strings)
    var targets = target_strings.map(parse_concept_string);
    return { edge_type, targets };
}
exports.get_targets = get_targets;
function get_edge_metadata(text) {
    let _lines = text.split("@");
    let data = _lines.splice(1).filter((x) => x != ""); //remove the concept line  
    var metadata = {};
    data.forEach((d) => {
        let tmp = d.split(/\s*:\s*/);
        let attribute = tmp[0].trim();
        let value = tmp[1].trim();
        metadata[attribute] = value;
    });
    return { metadata };
}
exports.get_edge_metadata = get_edge_metadata;
function parse_concept_string(cs) {
    //console.log(cs) 
    let tmp = cs.match(/<(.*)>/)[1].split("|");
    //console.log(tmp)
    let vertex_type = tmp[0].trim();
    var metadata = {};
    if (tmp.length > 1) {
        let toks = tmp[1].trim().split(/\s+/);
        //console.log(toks)
        toks.forEach((s) => {
            //console.log(s)
            let tmp2 = s.split("=");
            //console.log(tmp2)
            metadata[tmp2[0].trim()] = tmp2[1].trim();
        });
    }
    return { vertex_type, metadata };
}
exports.parse_concept_string = parse_concept_string;
function parse_chunk(chunk, concept) {
    //this is where it gets interesting -- > 
    var lines = chunk.split(/[\r\n]/);
    lines = lines.map((l) => l.split("#")[0].trim()); //only take stuff before comment   
    let text = lines.join("");
    //the first line will always specify the edge type as well as target(s) 
    let { edge_type, targets } = get_targets(text);
    let { metadata } = get_edge_metadata(text);
    return { edge_type, targets, edge_metadata: metadata, source: concept };
}
exports.parse_chunk = parse_chunk;
function parse_medik_file(fname) {
    let chunks = get_file_chunks(fname);
    //first chunk should be the concept  
    let concept = chunks[0].split(":")[1].trim().replace("<", "").replace(">", "");
    //now we loop thru 
    let relation_data = chunks.splice(1).map((x) => parse_chunk(x, concept));
    return { concept, relation_data };
}
exports.parse_medik_file = parse_medik_file;
exports.equivalencies_loc = "/Users/oluwa/dev/vcs/src/nodejs/typescript/src/medik/knowledge_src/equivalencies.txt";
function parse_alternatives(a) {
    let tmp = a.match(/\[(.*)\]/)[1].split(",").filter(util.str_not_empty).map(util.trim).map(util.char_remover('"'));
    return tmp;
}
exports.parse_alternatives = parse_alternatives;
function parse_equivalency_chunk(c) {
    let tmp = c.split("==");
    let key = util.char_remover('"')(tmp[0].trim());
    let alternative_raw = tmp[1].trim();
    let alternatives = parse_alternatives(alternative_raw);
    return { key, alternatives };
}
exports.parse_equivalency_chunk = parse_equivalency_chunk;
function parse_equivalencies(fname) {
    const fs = require("fs");
    let raw = fs.readFileSync(fname, 'utf-8');
    let lines = raw.split(/[\r\n]/);
    let no_comments = lines.map((l) => l.split("#")[0]).filter(util.str_not_empty).join("\n");
    let chunks = no_comments.split("::").filter(util.str_not_empty).map(util.trim);
    return chunks.map(parse_equivalency_chunk);
}
exports.parse_equivalencies = parse_equivalencies;
exports.debug = {
    "1": function () {
        return parse_medik_file(get_medik_files()[3]);
    },
    "2": function () {
        return parse_equivalencies(exports.equivalencies_loc);
    }
};
//# sourceMappingURL=parser.js.map