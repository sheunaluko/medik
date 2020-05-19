// - - - - - - - - - - - - - -  


let log = require("./logger").get_logger("util") 
require("./string_format") //interesting file :) . adds "as{arg1}dfa{arg2}s".format({args}) 

let params = {
    'local' : false  , 
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

//debug stuff 

export function ldb() { 
    return window.medik.debug[window.medik.debug.length-1]
}


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


export function build_sparql({select,lines,post}) { 
    return `
SELECT ${select}
WHERE { 
${lines.concat([""]).join(".\n")}
}
${post.join("\n")}
`
}


export async function sparql_query(s) { 
    log("sparql query : " + s) 
    let url_params = {'sparql' : s } 
    let value = await jfetch(url_base,url_params) 
    return value 
} 

export async function triples_query(dcids) { 
    let jsonids = JSON.stringify(dcids) 
    log("Triples query: " + jsonids) 
    let url_params = {'triples' : jsonids } 
    let value = await jfetch(url_base,url_params) 
    return value 
} 


export async function symptoms_of_doid(doid) { 
    let query = ` 

    ` 
    let result = await sparql_query(query)  
    return result 
} 



export async function dsa_for_symptom_dcid(dcid) { 
    /* 
       Use: 
       ORDER BY associationOddsRatio 
       LIMIT m 
    */ 
    let query = ` 
    SELECT ?a ?oddsRatio
    WHERE  {
        ?b dcid "${dcid}" . 
        ?a typeOf DiseaseSymptomAssociation .
        ?a medicalSubjectHeadingID ?b . 
        ?a associationOddsRatio ?oddsRatio . 
    }
    LIMIT 10
    ` 
    
    let result = await sparql_query(query)  
    return result     
    
}

// add potential function for getting all mesh subterms 


/* 

   Mesh functions 
   
*/

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




/* 
   - -
   WIKI DATA API => 
   - -
*/ 


/* 
  
   
   
*/

async function wiki_data_run_query(query) { 
    log("Doing wiki data query:") 
    log(query) 
    
    let url_base = "https://query.wikidata.org/sparql" 
    let url_params = { 'query' : query } 
    
    let value = await jfetch(url_base,url_params) 
    return value 
} 

/* 
let symptoms_of_disease = { 
    
    "label"  : 
    
	'SELECT ?item ?itemLabel ?symptom ?symptom_label
         WHERE 
         {
           ?item wdt:P31 wd:Q12136.
           ?item ?label "{query}"@en. 
           ?item wdt:P780 ?symptom.
           ?symptom ?label ?symptom_label filter (lang(?symptom_label) = "en") .  
           SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
         }' , 
    
    "doid" : 

	'SELECT ?item ?itemLabel ?symptom ?symptom_label
         WHERE 
         {
           ?item wdt:P31 wd:Q12136.
           ?item wdt:P699 "{query}". 
           ?item wdt:P780 ?symptom.
           ?symptom ?label ?symptom_label filter (lang(?symptom_label) = "en") .  
           SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
         }' , 
    
    "meshid" : 

	'SELECT ?item ?itemLabel ?symptom ?symptom_label
         WHERE 
         {
           ?item wdt:P31 wd:Q12136.
           ?item wdt:P486 "{query}". 
           ?item wdt:P780 ?symptom.
           ?symptom ?label ?symptom_label filter (lang(?symptom_label) = "en") .  
           SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
         }' , 
    
} 



let query_dictionary = { 
    symptoms_of_disease , 
}
*/

/*

async function wiki_hl_query(query_class,query_type,query) { 
    return await wiki_data_run_query(query_dictionary[query_class][query_type].format(query))
}

async function wiki_data_symptoms_of_disease(query,query_type="label"){ 
    return await wiki_hl_query('symptoms_of_disease',query_type,query) 
} 

*/


/* 
   Export ability to query wikidata symtoms of a disease given any of the following disease
   identifiers: 
   - meshid , doid, text label (latter must match exactly) 
   
   export var wd_sd_api =  { 
   'mesh' : (q) => wiki_data_symptoms_disease(q,'meshid') , 
    'doid' : (q) => wiki_data_symptoms_disease(q,'doid')   ,
    'label' : (q) => wiki_data_symptoms_disease(q,'label')  
    } 
   
*/



