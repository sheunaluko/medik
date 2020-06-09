// - - - - - - - - - - - - - -  

import fuse from 'fuse.js' 
import * as res from "./resources.js" 

let log = require("./logger").get_logger("util") 
require("./string_format") //interesting file :) . adds "as{arg1}dfa{arg2}s".format({args}) 

let params = {
    'local' : false  , 
}


export var API_KEY="AIzaSyADZE_-X7zmrU7LwlH-xwkcYIw95bkZfOQ" 




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

export function ldb(num=0) { 
    return window.medik.debug[window.medik.debug.length-1-num]
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

/* jfetch was designed to originally query the cloud function , but is still generic */ 
export async function  jfetch(url_base,url_params) { 
    
    let url = get_url_with_params(url_base,url_params) 
    
    log(`Using url: ${url}`) 
    
    let result = await fetch(url) 
    let jdata  = await result.json() 
    
    log("Done") 
    window.medik.debug.push(jdata)  
    log("Got value: " + JSON.stringify(jdata)) 
    
    return jdata 
} 


//curl 'https://api.datacommons.org/node/triples?key=API_KEY&dcids=geoId/05&dcids=geoId/06'
function get_url_with_params_v2(url,params) { 
    var url = new URL(url) 
    var urlp = new URLSearchParams() 
    
    urlp.append("key", API_KEY) 
    
    let keys = Object.keys(params) 
    for (var k of keys) { 
	let val = params[k]
	if (val.constructor == Array ) {
	    //an array 
	    for (var sval of val ) { 
		urlp.append(k,sval)
	    } 
	}  else { 
	    urlp.append(k,val)
	} 
    } 
    
    url.search = urlp.toString() 
    return url 
} 


/* 
   http_fetch will directly query GDC via rest API
   Decided to use this rather than the python cloud function so I could directly 
   see errors 
 */
export async function  http_fetch(url_base,url_params) { 
    
    let url = get_url_with_params_v2(url_base,url_params) 
    
    log(`Using url: ${url}`) 
    
    let result = await fetch(url) 
    let jdata  = await result.json() 
    
    log("Done") 
    window.medik.debug.push(jdata)  
    let data = JSON.parse(jdata.payload) 
    window.medik.debug.push(data)  
    log("Got value: " + JSON.stringify(data)) 
    
    return data
} 

export async function gdc_prop_values(dcids,property) { 
    
    //will batch the dcids by 100 at a time 
    //Turned out that more than 100 causes an error 
    if (dcids.length > 100 ) { 
	let rest_dcids = dcids.splice(100) 
	//dcids will be first 100 now 
	//so we recursively call on each subpart and merge the dictionaries 
	log("Doing recursion!") 
	let first = await gdc_prop_values(dcids,property) 
	let rest        = await gdc_prop_values(rest_dcids,property) //will also recurse if need
	
	Object.assign(first,rest) 
	return first //will actually contain merged total  
    } 
    
    //if less than 100 will just proceed 
    let url = 'https://api.datacommons.org/node/property-values' 
    let params = { 
	dcids,
	property 
    } 
    return await http_fetch(url,params) 
} 

export async function gdc_triples(dcids) { 
    let url = 'https://api.datacommons.org/node/triples' 
    let params = { 
	dcids
    } 
    return await http_fetch(url,params) 
} 

export async function gdc_symptom_triples(dcids) { 
    let result = await gdc_triples(dcids) 
    //will have a dictionary keyed by the dcids 
    
    let keys = Object.keys(result) 
    
    for (var k of keys) { 
	log("Processing key: " + k) 
	let data = result[k] 
	
	let onum = data.length 
	//if there were no triples found the result will be an empty array 
	//either way we can filter the data by predicate=medicalSubjectHeadngID 
	result[k]  = data.filter(x=> (x.predicate == "medicalSubjectHeadingID"))
	
	let fnum = result[k].length 
	log(`Num: ${onum}, Kept ${fnum}`)
    } 
    
    window.medik.debug.push(result) 
    return result 
    
} 

/// -- !! 
export async function get_triple_property_values(triple_info,property) { 
    //triple info is a dictionary from gdc_symptom_triples 
    //could have empty array [] 
    var to_return = {} 
    
    //for each key we will get the array of data 
    for (var k of Object.keys(triple_info)) { 
	log("Processing key: " + k) 
	let data = triple_info[k] 
	
	//extract a list of the dcids 
	let dcids = data.map(x=>x.subjectId) 
	
	if (dcids.length == 0) { 
	    log("No data to lookup") 
	    to_return[k] = []
	} else { 
	    to_return[k] = await gdc_prop_values(dcids,[property]) 
	} 
    } 
    
    return to_return 
    
} 

export function get_doid_from_dsa(dsa) { 
    return dsa.split("_").slice(0,2).join("_")
}

export async function get_doid_names(triple_info) { 
     //triple info is a dictionary from gdc_symptom_triples 
    //could have empty array [] 
    var to_return = {} 
    
    //for each key we will get the array of data 
    for (var k of Object.keys(triple_info)) { 
	log("Processing key: " + k) 
	let data = triple_info[k] 
	
	//extract a list of the dcids 
	let dcids = data.map(x=>x.subjectId) 
	//and convert them to the DOIDS 
	let doids = dcids.map(get_doid_from_dsa) 
	
	if (doids.length == 0) { 
	    log("No data to lookup") 
	    to_return[k] = []
	} else { 
	    to_return[k] = await gdc_prop_values(doids,["commonName"]) 
	} 
    } 
    
    return to_return 
}

export async function main_symptom_lookup(dcids) { 
    let tmp  = await base_symptom_lookup(dcids) 
    let results = tmp.results
    let disease_info = get_disease_info(results) 
    let ranking = calculate_rankings_1(disease_info) 
    
    window.medik.debug.push({tmp,results,disease_info,ranking})
    return {ranking ,results } 
} 

export async function base_symptom_lookup(dcids) { 

    let tinfo      = await gdc_symptom_triples(dcids) 
    let odds_data  = await get_triple_property_values(tinfo,"associationOddsRatio") 
    let doid_data  = await get_doid_names(tinfo)
    
    window.medik.debug.push({odds_data,doid_data,tinfo,id:"pre_result"} ) 
    
    //now we have to combine these results into a nicer format
    var results = {} 
    
    for (var sdcid of Object.keys(odds_data) ) { 
	//log("sdcid: " + sdcid) 
	
	let result = [] 

	let dic = odds_data[sdcid] 
	
	for (var dsa_dcid of Object.keys(dic) ) { 
	    
	    //log("dsaid: " + dsa_dcid) 
	    if (! dic[dsa_dcid]['out'] ) { continue } //had random empty dic 
	    
	    let or = Number(dic[dsa_dcid]['out'][0].value) //get the odds ratio 
	    let d_dcid = get_doid_from_dsa(dsa_dcid) 
	    let dname = doid_data[sdcid][d_dcid]['out'][0].value 
	    
	    
	    result.push({or,dsa_dcid,d_dcid,dname,sdcid})
	} 
	
	//now sort by odds ratio 
	let or_sort_desc = function(x1,x2) { 
	    if ( x1.or > x2.or ) return -1; 
	    if ( x2.or > x1.or ) return 1; 
	    return 0 
	} 
	result.sort(or_sort_desc) 
	results[sdcid] = result 
    } 
    
    return {tinfo, odds_data, doid_data , results} 
} 


//create function for calculating the disease rankings 
export function calculate_rankings_1(disease_info,metric='or_sum') { 
    //disease info will be a map 
    //first convert it to an array 
    let ranking = [] 
    
    for (var d of Object.keys(disease_info) ) {
	let entry = disease_info[d] 
	let num   = entry.length //number of symptom matches for this disease 
	let ors   = entry.map(x=>x.or) 
	let or_sum = ors.reduce( (a,b)=>a+b) 
	let or_mul = ors.reduce( (a,b)=>a*b) 
	
	let dnames = entry.map(x=>x.dname) 
	let d_dcids = entry.map(x=>x.d_dcid) 
	
	//make sure data is consistent 
	let all_good = ( new Set(dnames).size == 1 ) && ( new Set(d_dcids).size == 1 )  
	if (! all_good) { throw("Inconsistent data found!") } 
	
	let name= dnames[0] 
	let d_dcid = d_dcids[0] 
	
	let associated_symptoms = entry.map(x=>x.sdcid) 
	
	ranking.push( {entry,num,ors,or_sum,or_mul,name,d_dcid,associated_symptoms} ) 
    } 
    
    //now we can define our sorting function 
    let disease_sorter_1 = function(d1,d2) { 
	//first sort by number of symptom matches
	if (d1.num > d2.num ) return -1 ;  
	if (d2.num > d1.num ) return 1  ; 
	//if they have the same number of matches we either 
	//sort by sum or mult of odds ratio 
	if (d1[metric] > d2[metric]) return -1 
	if (d2[metric] > d1[metric]) return 1 
 	return 0 
    } 
	
    ranking.sort(disease_sorter_1) 
    
    for (var i =0;i<ranking.length;i++) {
	ranking[i].rank = i+1 
    } 
    
    return ranking 

} 

export function get_disease_info(results) { 
    /* 
       Assume we get a result produced by 'main_symptom_lookup' which 
       consists of a dict { symptom1_dcid : [{} .. ]  , .. } where keys are symptom dcids 
       and values are arrays of dicts with keys or,dname,d_dcid
       
    */ 
    
    var all_results = [] 
    for (var k of Object.keys(results)) { all_results = all_results.concat(results[k]) } 

    var diseases = {}  //keeps track of all diseases 
    
    for (var r of all_results ) { 
	let doid = r.d_dcid
	if (diseases[doid] != undefined ){
	    diseases[doid].push(r)
	} else { 
	    diseases[doid] = [r]
	} 
    } 
    
    return diseases 
    
} 




export async function test_prop_values() {
    let dcids =  ["geoId/05" , "geoId/06" ]  
    let properties = ["name"] 
    return await gdc_prop_values(dcids,properties) 
} 

export async function test_triples() { 
    let dcids = ["geoID/05" , "geoID/06"] 
    return await gdc_triples(dcids) 
} 
    

/*
export async function test_fetch() {
    params.append("key",API_KEY)  
    for (var d of dcids) { 
	params.append("dcids",d)
    } 
    for (var p of properties) {
	params.append("property",p) 
    }

    url = new URL(url) 
    url.search  = params.toString() 
    
    log(`Using url: ${url}`) 
    
    let result = await fetch(url) 
    let jdata  = await result.json() 
    
    log("Done") 
    window.medik.debug.push(jdata)  
    
    let data = JSON.parse(jdata.payload) 
    window.medik.debug.push(data) 
    log("Got value: " + JSON.stringify(data)) 
    
    return jdata 
} 
*/ 



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


export function transform_dcids(dcids) { 
    let wrap_quote = (x) => '"' + x + '"' 
    return "(" + dcids.map(wrap_quote).join(" ") + ")" 
} 


export async function dsa_for_symptom_dcids(dcids) { 
    /* 
       DOCS: 
       dsa   = disease symptom association 
       d     = disease 
       s     = symptom 
       dname = disease name 
       sname = symptom name 
    */ 
    let dcids_string = transform_dcids(dcids) 
    let query = ` 
    SELECT DISTINCT ?dsa ?oddsRatio ?dname ?sname 
    WHERE  {
        ?s typeOf MeSHDescriptor . 
        ?s dcid ${dcids_string} . 
        ?s descriptorName ?sname . 
        ?d typeOf Disease . 
        ?d commonName ?dname  . 
        ?dsa typeOf DiseaseSymptomAssociation .
        ?dsa medicalSubjectHeadingID ?s . 
        ?dsa diseaseOntologyID ?d . 
        ?dsa associationOddsRatio ?oddsRatio . 
    }
    ORDER BY DESC(?oddsRatio)
    LIMIT 200
    ` 
    let result = await sparql_query(query)  
    return result     
}


export async function dsa_for_symptom_dcid(dcid) { 
    /* 
       DOCS: 
       dsa   = disease symptom association 
       d     = disease 
       s     = symptom 
       dname = disease name 
       sname = symptom name 
    */ 
    let query = ` 
    SELECT DISTINCT ?dsa ?oddsRatio ?dname ?sname 
    WHERE  {
        ?s dcid "${dcid}" . 
        ?s descriptorName ?sname . 
        ?d typeOf Disease . 
        ?d commonName ?dname  . 
        ?dsa typeOf DiseaseSymptomAssociation .
        ?dsa medicalSubjectHeadingID ?s . 
        ?dsa diseaseOntologyID ?d . 
        ?dsa associationOddsRatio ?oddsRatio . 
    }
    ` 
    let result = await sparql_query(query)  
    
    //parse the odds ratios as strings 
    let convert_or = function(x) { 
	x['or'] = Number(x['?oddsRatio']) 
	return x 
    } 
    result.map(convert_or)
    
    //sort array by the odds ratio 
    let or_sort = function(x1,x2) { 
	if ( x1.or > x2.or ) return 1; 
	if ( x2.or > x1.or ) return -1; 
	return 0 
    } 
    
    result.sort(or_sort) 
    
    return result     
}






export function search_mesh(t) { 
    return res.mesh_descriptors.filter(d=> d["?name"].match(new RegExp(t,"i")) ) 
} 


export function get_test_queries(num)  { 
    return res.test_queries[num].map(t=> ( { 'dcid' : res.symptom_dictionary[t]['dcid'], 'name' : t} ))
} 


export async function main_query_handler_v1(query) { 
    //query is an array of objects with fields dcid 
    //these are symptoms 
    let dcids = query.map(x=>x['dcid']) 
    let results = await dsa_for_symptom_dcids(dcids) 
    return results
} 


/* 
 Searching stepUp2Medicine Book   
 */ 

window.fuse = fuse 
export var su2m = Object.keys(res.stepUp2Med).map(k=>({ name : k , info : res.stepUp2Med[k][2] , workup : res.stepUp2Med[k][3] })) //.filter(x=> (x.name != "" && x.info != "" && x.res != ""))

const options = {
  includeScore: true,
    threshold : 0.4, 
  useExtendedSearch: true,
    keys:  [ "name" ]   , 

}

export var fuse_instance = new fuse(su2m, options)

export function fuse_search(q) { 
    let query = q.toLowerCase().replace("disease","").replace("syndrome","").split(" ").join(" | ") 
    
    console.log("searching: " + query) 
    
    return fuse_instance.search(query)
}

// Search for items that include "Man" and "Old",
// OR end with "Artist"
//fuse.search("'Man 'Old | Artist$")






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



