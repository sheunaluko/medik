// - - - - - - - - - - - - - -  


let log = require("./logger").get_logger("util") 


/* 
   Network Request Util 
*/ 

//let url_base = window.medik.res.cloud_function_url
let url_base = "http://127.0.0.1:5000/" 


export function get_url_with_params(url,params) { 
    url = new URL(url) 
    url.search = new URLSearchParams(params).toString() 
    return url 
} 

export async function  jfetch(url_base,url_params) { 
    
    let url = get_url_with_params(url_base,url_params) 
    
    log(`Using url: ${url}`) 
    
    let result = await fetch(url) 
    let jdata  = await result.json() 
    
    log("Done") 
    
    return jdata 
    
} 


export async function sparql_query(s) { 
    
    log("sparql query : " + s) 
    
    let url_params = {'sparql' : s } 
    
    let value = await jfetch(url_base,url_params) 
    
    window.medik.debug.push(value) 

    return 
} 


export async function triples_query(dcids) { 
    
    let jsonids = JSON.stringify(dcids) 
    
    log("Triples query: " + jsonids) 
    
    let url_params = {'triples' : jsonids } 
    
    let value = await jfetch(url_base,url_params) 
    
    window.medik.debug.push(value) 

    return 

    
} 





