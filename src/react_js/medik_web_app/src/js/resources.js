
import descriptors from  "./GDC_MeSHDescriptor_All.json"  

export var mesh_descriptors = descriptors  


export var cloud_function_url = "https://us-central1-medikapp-274018.cloudfunctions.net/function-2" 


export var sparql_ex = { 
    'v2' : {  
	"place" : '\nSELECT ?a ?name WHERE  { ?a typeOf Place .  ?b dcid "geoId/06" . ?a containedInPlace ?b . ?a name ?name . }  LIMIT 50' , 
	
	
    } ,
    
    'v3' : null 

} 

export var symptom_dictionary = { 
    'Fever' : { 'dcid' : 'bio/D005334' } , 
    'Cough' :   { 'dcid' : 'bio/D003371' } , 
    'Fatigue' :   { 'dcid' : 'bio/D005221' } , 
    'Weight Loss' :   { 'dcid' : 'bio/D015431' } , 
    'Edema' :   { 'dcid' : 'bio/D004487' } , 
    'Abdominal Pain' :   { 'dcid' : 'bio/D015746' } , 
    'Obesity' :   { 'dcid' : 'bio/D009765' } , 
    'Nausea' :   { 'dcid' : 'bio/D009325' } ,     
    'Lymphadenopathy' : { 'dcid' : 'bio/D000072281' }, 
    'Null' : { 'dcid' : 'bio/D022341' },     
} 

export var test_queries = { 
    //note -- these can be transformed using symptom dictionary above 
    '1' : [
	'Fever',
	'Cough', 
	'Fatigue'
    ] , 
    
    '2' : [ 
	'Abdominal Pain' , 
	'Obesity' , 
	'Nausea'  
    ] , 
    
    '3'  : [ 
	'Fever', 
	'Weight Loss', 
	'Lymphadenopathy' 
    ] 
} 

