import * as gg from "./graph"  
import * as gu from "./utilities"
import * as util from "../utils/index"

declare var global : any; 

export var main = { 
    "1" : function() { 
        var G = new gg.Graph({}) 

        let rel  = { 
            source : "dog" , 
            target : "animal" , 
            edge   : "is"  , 
            
        }

        G.add_relation(rel) 
        return G 
    }, 

    "2" : function() {  
        //modify HERE !         
        var G = new gg.Graph({}) 

        G.add_relation({ 
            source : "dog" , 
            edge   : "is a"  ,             
            target : "animal" 
        })

        G.add_relation({ 
            source : "animal" , 
            edge   : "is a"  ,             
            target : "organism" 
        })

        G.add_relation({ 
            source : "organism" , 
            edge   : "is a"  ,             
            target : "living thing"  
        })
        

        return G 
    },

    "3" : function() { 
        //attempt to create a mbfs search

        //create the graph 
        let G = main["2"]()

        
        //define the search functions 
        let check_terminate = async function(p:gu.Path,G : gg.Graph) : Promise<gu.CheckReturn>{ 
            /* just check the length of the path */ 
            return { result : (p.vertices.length > 5) , data : {} }
        }

        let check_succeed = async function(p:gu.Path,G : gg.Graph) : Promise<gu.CheckReturn> { 
            /* will succeed if we have to "is a" in a row */ 
            let edge_ids = p.edges.map( (e:gg.Edge) => e.data.id_readable) 
            let succeed = (util.sets_equal(new Set(edge_ids),util.set("is a"))  && (edge_ids.length > 1 )  )
            return {result : succeed , 
                    data :  { info : succeed ? "string of is a's" : "no match or too short" }} 
        }

        let get_next_vertices = async function(p:gu.Path,G : gg.Graph) : Promise<gu.Outflows> { 
            //look at the outgoing edges
            let outgoing_numeric_ids = util.last(p.vertices).data.outgoing 
            //filter the IDs based on "is a" 
            let filtered_ids = outgoing_numeric_ids.filter( 
                (uid:number) => G.edges.edge_is_type(uid,"is a") //uid is 'unique' id 
            ) 
            //retrieve the requested ids from the graph 
            return filtered_ids.map(
                (id :number) => { 
                    let edge = G.edges.get_unique(id) 
                    let vertex_id = edge.data.target 
                    let vertex = G.vertices.get(vertex_id)
                    let e2v : gu.EdgeToVertex = { edge , vertex }
                    return e2v
                }
            )
        }



        //create the options 
        var mbfs_ops : gu.BFS_Search_Ops = { 
            check_terminate , 
            check_succeed  , 
            get_next_vertices 
        }


        let MBFS = new gu.MBFS(G,mbfs_ops)

        return MBFS

    } , 
    
    "4" : async function() {
        let mbfs = main["3"]() //get the mbfs object 
        //build start state - the dog node 
        let start = new gu.Path({
            vertices : [mbfs.G.vertices.get("dog")], 
            edges : ([] as gg.Edge[]) 
        })
        //run it :/        
       let result = await mbfs.compute(start)
       console.log("mbfs finished") 
       console.log(mbfs.coordinator.jobs)  
       
       global['result'] = result 
       global['G'] = mbfs.G
    }
    
}

let x = main["4"]() 

