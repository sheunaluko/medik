import * as parser from "../mk_parser/parser" 
import * as G      from "../../generic_graph/graph"
import * as util   from "../../utils/index"

const log = util.get_logger("medik") 

interface ConceptData { 
    vertex_type : string, 
    metadata : {[k:string] : string}  
}

interface RelData { 
    source : string, 
    edge_type : string, 
    targets : ConceptData[] , 
    edge_metadata : {[k:string] : string} 
}


export function convert_relation_data_to_relations(dat : RelData) { 

    let {source,edge_type,targets,edge_metadata} = dat  //destructure

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

     let relations = targets.map(
        function(t : ConceptData) { 
            let tmp = { 
                source , 
                target : t.vertex_type , 
                edge : edge_type , 
                metadata : { 
                    edge : edge_metadata , 
                    vertex : t.metadata  
                }
            }

            return tmp  
        }
     )

    return relations 
}


interface ParsedFile { 
    concept : string, 
    relation_data : RelData[] 
}

export function convert_parsed_file_to_relations(pf :ParsedFile) { 
    let {concept,relation_data} = pf 
    return relation_data.map(convert_relation_data_to_relations).flat() 
}


export var graph = new G.Graph({}) 

export function add_parsed_file_to_graph(pf : ParsedFile) {  

    let relations = convert_parsed_file_to_relations(pf)
    log.i("Adding concept file to graph :  " + pf.concept)

    relations.map((r : G.Relation) => graph.add_relation(r)) 
}


export function add_equivalencies_to_graph(g : G.Graph) {
    let equivalencies = parser.parse_equivalencies(parser.equivalencies_loc)
    equivalencies.map( (e : any) => { 
         let {key,alternatives} = e 
         alternatives.map((alias : string) => {
            graph.add_alias({key,alias})
         })
    })

}


export function run() { 

    if ( false ) { 
    console.log("-----------------------------------------")
    console.log("\n\n\n")
    console.log("-----------------------------------------")
    }

    let files = parser.get_medik_files()  
    let parsed_files =  files.map(parser.parse_medik_file)

    // first we add the aliases 
    add_equivalencies_to_graph(graph) 

    //then we populate the graph 
    parsed_files.map(add_parsed_file_to_graph) 

} 

export function entities_with_symptom(SX : string) { 
        //what diseases have symptom SX? 
        //first get the SX vertex 
        let _SX = graph.vertices.get(SX) 

        //get incoming edges 
        let incoming_edges = _SX.data.incoming 

        //filter those to get ones of type 'symptom' 
        let symptom_incoming_ids = graph.filter_edge_uids_by_type(incoming_edges,"symptom") 

        //retrieve the actual edges 
        let symptom_incoming =  graph.get_edge_set(symptom_incoming_ids) 

        //and get the sources
        let sources = symptom_incoming.map((e: G.Edge) => {
            return graph.vertices.get(e.data.source)
        })
        
        return sources 
}

/*  TODO   

    Filter edges by TYPE AND by Attribute metadata 
    acute onset 

*/ 

export var debug = { 
    '1' : function() { 

        run() 
        
        return entities_with_symptom("cough") 

        

    }
}

