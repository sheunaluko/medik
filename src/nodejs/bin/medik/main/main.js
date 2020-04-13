"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser = __importStar(require("../mk_parser/parser"));
const G = __importStar(require("../../generic_graph/graph"));
const util = __importStar(require("../../utils/index"));
const log = util.get_logger("medik");
function convert_relation_data_to_relations(dat) {
    let { source, edge_type, targets, edge_metadata } = dat; //destructure
    /*
    need to capture the vertex metadata and store it WITH the
    edge metadata

    the input to the G.add_relation looks like this :

    type ID = string | number ...
        
     {source : ID,
      target : ID ,
      edge   : ID ,
      metadata   : {[id:string] : any } }

    Now, in this parsed structure, targets : ConceptData[]
    This is

     */
    let relations = targets.map(function (t) {
        let tmp = {
            source,
            target: t.vertex_type,
            edge: edge_type,
            metadata: {
                edge: edge_metadata,
                vertex: t.metadata
            }
        };
        return tmp;
    });
    return relations;
}
exports.convert_relation_data_to_relations = convert_relation_data_to_relations;
function convert_parsed_file_to_relations(pf) {
    let { concept, relation_data } = pf;
    return relation_data.map(convert_relation_data_to_relations).flat();
}
exports.convert_parsed_file_to_relations = convert_parsed_file_to_relations;
exports.graph = new G.Graph({});
function add_parsed_file_to_graph(pf) {
    let relations = convert_parsed_file_to_relations(pf);
    log.i("Adding concept file to graph :  " + pf.concept);
    relations.map((r) => exports.graph.add_relation(r));
}
exports.add_parsed_file_to_graph = add_parsed_file_to_graph;
function add_equivalencies_to_graph(g) {
    let equivalencies = parser.parse_equivalencies(parser.equivalencies_loc);
    equivalencies.map((e) => {
        let { key, alternatives } = e;
        alternatives.map((alias) => {
            exports.graph.add_alias({ key, alias });
        });
    });
}
exports.add_equivalencies_to_graph = add_equivalencies_to_graph;
function run() {
    if (false) {
        console.log("-----------------------------------------");
        console.log("\n\n\n");
        console.log("-----------------------------------------");
    }
    let files = parser.get_medik_files();
    let parsed_files = files.map(parser.parse_medik_file);
    // first we add the aliases 
    add_equivalencies_to_graph(exports.graph);
    //then we populate the graph 
    parsed_files.map(add_parsed_file_to_graph);
}
exports.run = run;
function entities_with_symptom(SX) {
    //what diseases have symptom SX? 
    //first get the SX vertex 
    let _SX = exports.graph.vertices.get(SX);
    //get incoming edges 
    let incoming_edges = _SX.data.incoming;
    //filter those to get ones of type 'symptom' 
    let symptom_incoming_ids = exports.graph.filter_edge_uids_by_type(incoming_edges, "symptom");
    //retrieve the actual edges 
    let symptom_incoming = exports.graph.get_edge_set(symptom_incoming_ids);
    //and get the sources
    let sources = symptom_incoming.map((e) => {
        return exports.graph.vertices.get(e.data.source);
    });
    return sources;
}
exports.entities_with_symptom = entities_with_symptom;
/*  TODO

    Filter edges by TYPE AND by Attribute metadata
    acute onset

*/
exports.debug = {
    '1': function () {
        run();
        return entities_with_symptom("cough");
    }
};
//# sourceMappingURL=main.js.map