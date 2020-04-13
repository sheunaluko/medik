"use strict";
/*
 Generic graph implementation (typescript)
 Thu Mar 05 22:30:20 2020
 Sheun Aluko

This file defines the Graph class and Interface  (as well as Edge/Vertex)
Other files implement the Graph search algorithms


 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../utils/index"));
const log = util.get_logger("graph");
log.disable();
//temporary debug 
var debug = function (m) {
    //    console.log(m)
};
class Vertex {
    constructor(ops) { this.data = ops; }
    add_outgoing(id) {
        //make sure that the id is not duplicated 
        if (this.has_outgoing(id)) {
            debug("Will not duplicate id: " + id);
            return;
        }
        else {
            this.data.outgoing.push(id);
        }
    }
    add_incoming(id) {
        //make sure that the id is not duplicated 
        if (this.has_incoming(id)) {
            debug("Will not duplicate id: " + id);
            return;
        }
        else {
            this.data.incoming.push(id);
        }
    }
    has_outgoing(id) {
        return (this.data.outgoing.indexOf(id) > -1);
    }
    has_incoming(id) {
        return (this.data.incoming.indexOf(id) > -1);
    }
}
exports.Vertex = Vertex;
class Edge {
    //gets added by the graph 
    constructor(ops) {
        this.data = ops;
    }
}
exports.Edge = Edge;
/* houses translations of ids to human readable strings */
class Translations {
    constructor() {
        this.to_string = {};
        this.to_int = {};
    }
    translate(id) {
        if (id.constructor == String) {
            return this.to_int[id];
        }
        else {
            return this.to_string[id];
        }
    }
    int_id(id) {
        if (id.constructor == String) {
            return this.to_int[id];
        }
        else {
            return id;
        }
    }
    string_id(id) {
        if (id.constructor == Number) {
            return this.to_string[id];
        }
        else {
            return id;
        }
    }
    add({ string, number }) {
        this.to_string[number] = string;
        this.to_int[string] = number;
    }
}
exports.Translations = Translations;
/* define class which holds the edges */
class Edges {
    constructor() {
        this.translations = new Translations();
        this.edges = [];
    }
    /**
     *Get an edge by its TYPE ID
     *
     * @param {ID} id
     * @returns {MaybeEdgeArray}
     * @memberof Edges
     */
    get_type(id) {
        let int_id = this.translations.int_id(id);
        if (int_id === null) {
            return null;
        }
        //id exists in the translations... will search for it in the edge set 
        return this.edges.filter((e) => e.data.id == int_id);
    }
    /**
     *Get an edge by its UNIQUE ID
     *Accounts for all metadata in being unique
     * @param {Number} id
     * @returns {MaybeEdge}
     * @memberof Edges
     */
    get_unique(id) {
        /*
        Optimize later -> can have SET structure which tracks which edges exist,
        and check that FIRST prior to performing the filtering below
        */
        return this.edges.filter((e) => e.unique_id == id)[0];
    }
    /**
     *Check if an instance of edge already exists in the set
     *
     * @param {Edge} edge
     * @returns {boolean}
     * @memberof Edges
     */
    exists(edge) {
        let matches = this.edges.filter((e) => e.data === edge.data);
        switch (matches.length) {
            case 0:
                return false;
            case 1:
                return true;
            default:
                throw ("Ooopss. have duplicated edges somehow");
        }
    }
    id_exists(id) {
        return (this.translations.translate(id) !== undefined);
    }
    edge_id_exists(e) {
        return (this.id_exists(e.data.id) || this.id_exists(e.data.id_readable));
    }
    conform(e) {
        /*  will wrangle the edge ids to match the translation schema if one of them exists */
        // removed as was causing bug --> if (!this.edge_id_exists(e)) { throw ("Attempting to conform non existent edge id!")} 
        /* there are two possibilities */
        if (this.id_exists(e.data.id)) { //1) id matches 
            e.data.id_readable = this.translations.translate(e.data.id);
        }
        else if (this.id_exists(e.data.id_readable)) { //2) id_readable matches 
            e.data.id = this.translations.translate(e.data.id_readable);
        }
        else {
            //do nothing if neither ID exists, as the edge is already 'conformed'
            debug("passing through already conformed edge");
        }
        return e;
    }
    add(e, unique_id) {
        if (this.exists(e)) {
            throw ("Cannot add duplicate!");
        }
        let id_exists = this.edge_id_exists(e);
        if (!id_exists) {
            /* only update the translations if the id already exists ! */
            /* edges are nuanced because they can have same id but connect
                different source/target and contain different data */
            this.translations.add({ number: e.data.id, string: e.data.id_readable });
        }
        else {
            //update the edge so its ids match with the ids here 
            e = this.conform(e);
        }
        /*
            Now we need to add a unique identifier to this edge which distinguishes it
            from all others, taking to account its metadata , etc (not just id)
        */
        e.unique_id = unique_id;
        this.edges.push(e);
        log.i(`Added edge: [${e.data.id_readable},${e.unique_id}]`);
        return e;
    }
    ids_equal(a, b) {
        return (a === b) || (this.translations.translate(a) === b);
    }
    edge_is_type(e, t) {
        //first get the edge 
        let edge = this.get_unique(e);
        if (!edge) {
            return false;
        }
        let e_type_id = edge.data.id_readable;
        return this.ids_equal(e_type_id, t);
    }
    get_id_set(id) {
        if (this.id_exists(id)) {
            return {
                id: this.translations.int_id(id),
                id_readable: this.translations.string_id(id)
            };
        }
        else {
            return null;
        }
    }
}
exports.Edges = Edges;
/* class that houses vertices */
class Vertices {
    constructor() {
        this.translations = new Translations();
        this.vertices = [];
    }
    exists(id) {
        return (this.translations.translate(id) !== undefined);
    }
    get(id) {
        let int_id = this.translations.int_id(id);
        if (!int_id) {
            return null;
        }
        //id exists in the translations... will search for it in the edge set 
        return this.vertices.filter((vertex) => vertex.data.id == int_id)[0];
    }
    add(v) {
        if (this.exists(v.data.id)) {
            throw ("Cannot add duplicate!");
        }
        this.vertices.push(v);
        this.translations.add({ number: v.data.id, string: v.data.id_readable });
        log.i("Added vertex: " + v.data.id_readable);
        log.i(`Translation= ${v.data.id}<->${v.data.id_readable}`);
    }
    ids_equal(a, b) {
        return (a === b) || (this.translations.translate(a) === b);
    }
    get_id_set(id) {
        if (this.exists(id)) {
            return {
                id: this.translations.int_id(id),
                id_readable: this.translations.string_id(id)
            };
        }
        else {
            return null;
        }
    }
}
exports.Vertices = Vertices;
/* graph class definition */
class Graph {
    constructor(ops) {
        this.aliases = {};
        this.nonce = 0;
        this.ops = ops;
        this.vertices = new Vertices();
        this.edges = new Edges();
    }
    add_alias(op) {
        this.aliases[op.alias] = op.key;
    }
    gen_id() { return this.nonce++; }
    new_ids(id) {
        //debug("new id: " + id) 
        //first check if there is an alias 
        if (this.aliases[id]) {
            id = this.aliases[id];
            debug("hit alias and using: " + id);
        }
        let num_id = (id.constructor == String) ? this.gen_id() : id;
        let str_id = (id.constructor == String) ? id : String(id);
        return { id: Number(num_id), id_readable: str_id };
    }
    /**
     * Add new relationship to the graph. Nodes and edges that do not exist
     * will be created.
     *
     * @param {Relation} r
     * @memberof Graph
     */
    add_relation(r) {
        debug("Processing relation:");
        debug(r);
        let { source, target, edge, metadata } = r; //destructure the relation 
        let new_edge_ids = this.edges.get_id_set(edge) || this.new_ids(edge);
        let new_source_ids = this.vertices.get_id_set(source) || this.new_ids(source);
        let new_target_ids = this.vertices.get_id_set(target) || this.new_ids(target);
        /*
        check if the edge exists or not
        because edges can have nested data , the easiest way to do this is
        to build the edge and check if an instance exists
        */
        let _edge = new Edge({
            id: new_edge_ids.id,
            id_readable: new_edge_ids.id_readable,
            source: new_source_ids.id,
            target: new_target_ids.id,
            metadata: metadata,
        });
        /*
        Couple things to note here
        1) the edge id value will be bogus if the id_readable already exists
        Therefore if we want has_edge to appropriate return true we have to get the correct
        machine id for the newly created graph
        */
        var new_edge = this.edges.conform(_edge); //makes sure id,id_readable are consistent with Graph 
        debug("edge prior: ");
        debug(new_edge);
        if (this.has_edge(new_edge)) {
            //the edge already exists ... 
            //which must mean that the source and target already exist... 
            //so we will just return 
            debug("Edge already exists, so assuming source and target do as well and returning");
            return;
        }
        else {
            log.i(`Creating: ${new_source_ids.id_readable} -> ${new_edge_ids.id_readable} -> ${new_target_ids.id_readable}`);
            new_edge = this.edges.add(new_edge, this.gen_id());
        }
        debug("edge after:");
        debug(new_edge);
        /*
        At this point, the desired edge did not exist and was created ,
        BUt we still have to create/modify the source and target:
        */
        /* we deal with the source vertex first */
        debug("checking source vertex: " + new_source_ids.id_readable);
        if (!this.has_vertex(new_source_ids.id_readable)) {
            debug("not exists!\n\n");
            let { id, id_readable } = new_source_ids;
            let vertex = new Vertex({
                id,
                id_readable,
                incoming: [],
                outgoing: [new_edge.unique_id]
            });
            this.vertices.add(vertex); //add the vertex to the graph 
        }
        else {
            debug("exists");
            //vertex already exists... so we will get it and then update it 
            let v = this.vertices.get(new_source_ids.id_readable);
            // BEWARE OF BUG !! -> v.add_outgoing(new_target_ids.id) 
            // (leaving there for future incredulousness)  
            // added the target vertex as outging rather than edge 
            v.add_outgoing(new_edge.unique_id);
        }
        /* then the target vertex */
        debug("checking target vertex: " + new_target_ids.id_readable);
        if (!this.has_vertex(new_target_ids.id_readable)) {
            debug("not exist!\n\n");
            //target does not exist -- so create it 
            let { id, id_readable } = new_target_ids;
            let vertex = new Vertex({
                id,
                id_readable,
                incoming: [new_edge.unique_id],
                outgoing: []
            });
            this.vertices.add(vertex);
        }
        else {
            debug("exist");
            let v = this.vertices.get(new_target_ids.id_readable);
            v.add_incoming(new_edge.unique_id);
        }
        log.i("Done\n");
    }
    has_vertex(id) {
        return this.vertices.exists(id);
    }
    has_edge(e) { return this.edges.exists(e); }
    edge_type_filter(t) {
        let edge_is_type = this.edges.edge_is_type.bind(this.edges);
        return function (uid) {
            return edge_is_type(uid, t);
        };
    }
    filter_edge_uids_by_type(uids, t) {
        return uids.filter(this.edge_type_filter(t));
    }
    get_edge(uid) {
        return this.edges.get_unique(uid);
    }
    get_edge_set(uids) {
        return uids.map((u) => this.edges.get_unique(u));
    }
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map