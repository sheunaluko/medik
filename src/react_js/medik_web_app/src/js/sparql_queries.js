
import * as util from "./util" 


/* 
   
   High level wrapper around the sparql query api 
   
*/

//[x]
export async function ten_diseases() { 
    
    let query = util.build_sparql({
	
	select : "?a ?name" , 
	
	lines: ["?a typeOf DiseaseSymptomAssociation",
		"?a name ?name"], 
	
	post : ["limit 10"]
	
    }) 
    
    util.sparql_query(query) 
}

//[x]
export async function ten_diseases_with_or() { 
    
    let query = util.build_sparql({
	
	select : "?a ?name ?oddsRatio" , 
	
	lines: ["?a typeOf DiseaseSymptomAssociation",
		"?a associationOddsRatio ?oddsRatio", 
		"?a name ?name" ], 
	
	post : ["limit 10" ,
		"distinct" ]
	
    }) 
    
    util.sparql_query(query) 
}


//[WORKING!!]
export async function search_symptom_meshid(meshid) { 
    
    let query = util.build_sparql({
	
	select : "DISTINCT ?a  ?oddsRatio ?dname" , 
	
	lines: [  `?b dcid "${meshid}"` , 
		  "?c typeOf Disease" , 
		  "?a typeOf DiseaseSymptomAssociation", 
		  "?a meSHID ?b" , 
		  "?a diseaseOntologyID ?c" , 
		  "?c commonName ?dname" , 
		  "?a associationOddsRatio ?oddsRatio" ] , 
	
	post : ["ORDER BY DESC(?oddsRatio)",
		"LIMIT 50"]  , 
		
    }) 
    
    util.sparql_query(query) 
    
} 


/*
let tmp = ' 
SELECT ?a ?name ?co ?odds
WHERE { 
?a typeOf DiseaseSymptomAssociation.
?a associationCooccurrence ?co.
?a associationOddsRatio ?odds. 
?a name ?name.
}
limit 10
' 
*/


/* 
 
   Working Queries: 
   
SELECT DISTINCT ?a ?oddsRatio ?dname
    WHERE  {
        ?b dcid "bio/MeSH_D006469" . 
        ?c typeOf Disease. 
        ?a typeOf DiseaseSymptomAssociation .
        ?a meSHID ?b . 
        ?a diseaseOntologyID ?c .
       ?c commonName ?dname.  
        ?a associationOddsRatio ?oddsRatio .
     }
ORDER BY DESC(?oddsRatio)
  LIMIT 20   
   
 */
