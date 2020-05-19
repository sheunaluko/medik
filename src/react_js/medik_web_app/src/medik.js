

import * as util from "./js/util" 
import * as res  from "./js/resources" 
import * as sparql from "./js/sparql_queries" 


var log = function(msg) { 
    console.log(`[medik]:: ${msg}`) 
} 

window.medik = { 
    debug : [] , 
    util , 
    res , 
    log , 
    sparql ,
}

window.util = window.medik.util ;
window.res  = window.medik.res  ; 
window.sparql  = window.medik.sparql ; 



