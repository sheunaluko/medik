// - - - - - - - - - - - - - -  


let log = require("./logger").get_logger("util") 
let params = {
    'local' : false 
}


/* 
   Network Request Util 
   
   Useful functions: 
   
   mesh_contains() 
   mesh_exact() 
           - both will search for MeSHDescriptors and return json array 
	   - these query the MeSH ncbi api and does NOT use GCP key 
	  
   sparql_query()
   triples_query() 
           - these query a PUBLIC GCP IP rest api that runs OUR MEDIK CLOUD FUNCTION
	   - The cloud function uses our Data Commons API key and the python datacommons 
            library in order to service the data commons request  
            

   hetio_query(cipher_query_string)  
        - Allows you to directly query the public hetionet server mainted by 
            UCSF PhD student Himmelstein 
        - Does not use any private APIs 
        - Main usade: _ = await hetio_query(cypher_query_string,optional_args=null)  
            - For example, see hetio_node_labels()  
		

    TLDR: 
      - use the mesh_*  and hetio_query functions with more frequency that the {sparql/triples}_query ones,
          primarily because the latter ones make use of OUR GCP CLOUD FUNCTION and
	  GCP BILLING RATES MAY APPLY 
      - it is totally fine to use ALL functions interactively from the command line, but unless
        it is part of the application code during expected operations, please do not write a script
	that calls these APIs frequently 
	   
	   
   
*/ 


// -- SET the url_base variable (used for toggling ON/OFF cloud/local backend development) 
if (params.local) { 
    var  url_base = "http://127.0.0.1:5000/"
} else {
    var url_base = require("./resources").cloud_function_url  
}  

function get_url_with_params(url,params) { 
    url = new URL(url) 
    url.search = new URLSearchParams(params).toString() 
    return url 
} 

async function  jfetch(url_base,url_params) { 
    
    let url = get_url_with_params(url_base,url_params) 
    
    log(`Using url: ${url}`) 
    
    let result = await fetch(url) 
    let jdata  = await result.json() 
    
    log("Done") 
    window.medik.debug.push(jdata)  
    log("Got value: " + JSON.stringify(jdata)) 
    
    return jdata 
} 

export async function sparql_query(s) { 
    log("sparql query : " + s) 
    let url_params = {'sparql' : s } 
    let value = await jfetch(url_base,url_params) 
    return 
} 

export async function triples_query(dcids) { 
    let jsonids = JSON.stringify(dcids) 
    log("Triples query: " + jsonids) 
    let url_params = {'triples' : jsonids } 
    let value = await jfetch(url_base,url_params) 
    return 
} 

export async function mesh_lookup(ops) { 
    let {label,match,limit} = ops 
    log("mesh lookup: " + label) 
    let url_params = { 'label' : label ,
		       'match' : (match || "contains")   , 
		       'limit' : (limit || 10  )  }  
    let url_base = "https://id.nlm.nih.gov/mesh/lookup/term" 
    let value = await jfetch(url_base,url_params) 
} 

export async function mesh_contains(term) { 
    return (await mesh_lookup( {label : term, match : 'contains' } ) ) 
} 
export async function mesh_exact(term) { 
    return (await mesh_lookup( {label : term, match : 'exact' } ) )  
} 



/* 
    Added support for querying the (UCSF) hetionet api 

    Main usage: 
    await hetio_query(cypher_query_string,optional_args=null)  

    For example, see hetio_node_labels() 
*/ 


const neo4j = require('neo4j-driver')
const driver = neo4j.driver("bolt://neo4j.het.io:7687")
const session = driver.session()

function parse_hetio_response(r) { 
    let records =  r.records 
    return records.map( rec=>rec._fields ) 
}

export async function hetio_query(q,ops=null) { 
    log("hetio query: " + q ) 
    try {
        const result = await session.run(q , ops) 
        log("Got result") 
        let parsed_result = parse_hetio_response(result) 
        window.medik.debug.push([result, parsed_result]) 
        return parsed_result  
    } 
    catch (err) { 
        log("Got error")
        console.log(err)
    }
    finally { await session.close()  } 
}

export async function hetio_node_labels() { 
    let query =
     `MATCH (node)
      RETURN
          head(labels(node)) AS label,
          count(*) AS count
      ORDER BY count DESC`

      return await hetio_query(query) 
}

export async function close_neo() { 
    // on application exit:
    await driver.close()
} 







