


export var cloud_function_url = "https://us-central1-medikapp-274018.cloudfunctions.net/function-2" 


export var sparql_ex = { 
    'v2' : {  
	"place" : '\nSELECT ?a ?name WHERE  { ?a typeOf Place .  ?b dcid "geoId/06" . ?a containedInPlace ?b . ?a name ?name . }  LIMIT 50' , 
	
	
	
	
    } ,
    
    'v3' : null 

} 






export var sparql_ex_1  = `
    SELECT ?name ?a
    WHERE  {
        ?a typeOf Place .
        ?a name ?name . 
        ?a dcid ("geoId/06" "geoId/21") .
    }
`


/* 
   FAILS BECAUSE sparql cannot process table too big 
*/
export var sparql_ex_0  = `
    SELECT ?name ?dcid 
    WHERE  {
        ?a typeOf DiseaseSymptomAssociation .
        ?a name ?name . 
        ?a dcid ?dcid 
    }
    LIMIT 10 
`


export var sparql_ex_2  = `
    SELECT ?name ?dcid 
    WHERE  {
        ?a typeOf Place .
        ?a name ?name . 
        ?a dcid ?dcid .
    }
    LIMIT 10 
`


export var sparql_ex_3  = `
    SELECT ?name ?meshid
    WHERE  {
        ?a typeOf DiseaseSymptomAssociation .
        ?a name ?name . 
        ?a medicalSubjectHeadingID ?meshid .
    }
    LIMIT 10 
`

export var sparql_ex_4  = `
    SELECT ?name ?dcid 
    WHERE  {
        ?a typeOf Species .
        ?a name ?name . 
        ?a dcid ?dcid .
    }
    LIMIT 10 
`



export var sparql_ex_5  = `
    SELECT ?name ?dcid 
    WHERE  {
        ?a typeOf DiseaseSymptomAssociation .
        ?a name ?name . 
        ?a dcid bio/DOID_0050157_D006469_cooccurrence .
        ?a dcid ?dcid . 
    }
    LIMIT 10 
`
/* 
   WORKING EXAMPLE --> (6) for specific 
   
   If the property value is itself an entity/node, then you must FIRST declare this nodes 
   existence 
   
   Notes:
    - moving forward, will be update sometime soon in which the DCID form will 
      change 
         "bio/MeSH_D006469" =>  "bio/D006469" 
         "bio/DOID_0001816" =>  "bio/DOID_0001816"   
	 
   Must update this if this stops working 
   
*/ 
export var sparql_ex_6 = `
    SELECT ?a ?oddsRatio
    WHERE  {
        ?b dcid "bio/D006469" . 
        ?a typeOf DiseaseSymptomAssociation .
        ?a medicalSubjectHeadingID ?b . 
        ?a associationOddsRatio ?oddsRatio . 
    }
    LIMIT 10 
`


export var sparql_ex_7 = `
    SELECT ?a  ?or 
    WHERE  {
        ?b dcid "bio/DOID_0001816" . 
        ?a typeOf DiseaseSymptomAssociation .
        ?a diseaseOntologyID ?b . 
        ?a associationOddsRatio ?or .
    }
    LIMIT 10
`

export var sparql_ex_8 = `
    SELECT ?a  
    WHERE  {
        ?b dcid "bio/DOID_0001816" . 
        ?a typeOf DiseaseSymptomAssociation .
        ?a diseaseOntologyID ?b . 
    }
    LIMIT 10
`



/* 
   I manually looked up the mesh IDs for these 
   using: https://meshb.nlm.nih.gov/search    
   
   would be better to have automated tool for this   
   
   Potentially, could do sparql query with lung disease as
   root of tree structure, can use the Mesh sparql API 
   
*/
export var su2m_lung_diseases =  [ 
    ["pneumonia",  "D011014" , "DOID_552" ] , 
    ["lung abscess", "D008169" , "DOID_0060317" ] , 
    //["ventilator associated pneumonia", "D053717" ] , 
    ["tuberculosis" , "D014376", "DOID_0060317" ] , 
    ["influenza" , "D007251" , "DOID_8469" ]  , 
    ["emphysema" , "D004646" , "DOID_9675"], 
    ["chronic bronchitis" , "D029481" , "DOID_6132"] , 
    ["asthma", "D001249", "DOID_2841"] , 
    ["bronchiectasis" , "D001987" , "DOID_9563" ]  , 
    ["cystic fibrosis" , "D003550" , "DOID_1485" ] ,
    ["small cell lung cancer", "D055752" , "DOID_5409"] , 
    ["nonsmall cell lung cancer", "D002289", "DOID_3908" ] , 
    //["pleural effusion", "D010996" ,  ] , 
    ["empyema",  "D004653", "DOID_3798" ] , 
    ["pneumothorax", "D011030" , "DOID_1673" ], 
    ["tension pneumothorax", null , "DOID_1672" ],     
    ["malignant mesothelioma", null , "DOID_1790" ] , 
    ["interstitial lung disease", "D017563", "DOID_3082" ] , 
    ["sarcoidosis", "D012507" , "DOID_11335" ] , 
    ["wegener granulomatosis", "D014890" , "DOID_12132" ] , 
    ["churg-strauss syndrome", "D015267", "DOID_12132" ] , 
    ["coal worker's pneumoconiosis", "D055008", "DOID_10327"] ,
    ["asbestosis", "D001195" , "DOID_10320"] , 
    ["silicosis", "D012829" , "DOID_10325" ] , 
    ["berylliosis",  "D001607" , "DOID_10322" ], 
    ["hypersensitivity pneumonitis", "D000542"  , "DOID_841"],
    ["eosinophilic pneumonia", "D011657" , "DOID_841"],
    ["goodpasture syndrome" , "D019867" , "DOID_9808"] , 
    ["pulmonary alveolar proteinosis", "D011649" , "DOID_12120"] , 
    ["idiopathic pulmonary fibrosis", "D054990" , "DOID_0050156"], 
    //["radiation pneumonitis", "D017564" ,""] , 
    ["acute respiratory failure", "D012131", "DOID_0050156" ] , 
    ["acute respiratory distress syndrome", "D012128" , "DOID_0050156"] , 
    ["pulmonary hypertension", "D006976" , "DOID_6432"] , 
    ["cor pulmonale", "D011660"  , "DOID_8515"] , 
    ["pulmonary embolism", "D011655" , "DOID_8515" ] 
] 



