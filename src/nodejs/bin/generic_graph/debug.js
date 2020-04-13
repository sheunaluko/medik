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
const gg = __importStar(require("./graph"));
const gu = __importStar(require("./utilities"));
const util = __importStar(require("../utils/index"));
exports.main = {
    "1": function () {
        var G = new gg.Graph({});
        let rel = {
            source: "dog",
            target: "animal",
            edge: "is",
        };
        G.add_relation(rel);
        return G;
    },
    "2": function () {
        //modify HERE !         
        var G = new gg.Graph({});
        G.add_relation({
            source: "dog",
            edge: "is a",
            target: "animal"
        });
        G.add_relation({
            source: "animal",
            edge: "is a",
            target: "organism"
        });
        G.add_relation({
            source: "organism",
            edge: "is a",
            target: "living thing"
        });
        return G;
    },
    "3": function () {
        //attempt to create a mbfs search
        //create the graph 
        let G = exports.main["2"]();
        //define the search functions 
        let check_terminate = function (p, G) {
            return __awaiter(this, void 0, void 0, function* () {
                /* just check the length of the path */
                return { result: (p.vertices.length > 5), data: {} };
            });
        };
        let check_succeed = function (p, G) {
            return __awaiter(this, void 0, void 0, function* () {
                /* will succeed if we have to "is a" in a row */
                let edge_ids = p.edges.map((e) => e.data.id_readable);
                let succeed = (util.sets_equal(new Set(edge_ids), util.set("is a")) && (edge_ids.length > 1));
                return { result: succeed,
                    data: { info: succeed ? "string of is a's" : "no match or too short" } };
            });
        };
        let get_next_vertices = function (p, G) {
            return __awaiter(this, void 0, void 0, function* () {
                //look at the outgoing edges
                let outgoing_numeric_ids = util.last(p.vertices).data.outgoing;
                //filter the IDs based on "is a" 
                let filtered_ids = outgoing_numeric_ids.filter((uid) => G.edges.edge_is_type(uid, "is a") //uid is 'unique' id 
                );
                //retrieve the requested ids from the graph 
                return filtered_ids.map((id) => {
                    let edge = G.edges.get_unique(id);
                    let vertex_id = edge.data.target;
                    let vertex = G.vertices.get(vertex_id);
                    let e2v = { edge, vertex };
                    return e2v;
                });
            });
        };
        //create the options 
        var mbfs_ops = {
            check_terminate,
            check_succeed,
            get_next_vertices
        };
        let MBFS = new gu.MBFS(G, mbfs_ops);
        return MBFS;
    },
    "4": function () {
        return __awaiter(this, void 0, void 0, function* () {
            let mbfs = exports.main["3"](); //get the mbfs object 
            //build start state - the dog node 
            let start = new gu.Path({
                vertices: [mbfs.G.vertices.get("dog")],
                edges: []
            });
            //run it :/        
            let result = yield mbfs.compute(start);
            console.log("mbfs finished");
            console.log(mbfs.coordinator.jobs);
            global['result'] = result;
            global['G'] = mbfs.G;
        });
    }
};
let x = exports.main["4"]();
//# sourceMappingURL=debug.js.map