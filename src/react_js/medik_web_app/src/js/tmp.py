import json 



# You will need to create the data structure 
# using 'data' below as a template 

data = { 
    'cardiovascular' :  [ 
        { 'name' : "Myocardial Infaction",
          'further_steps' : "blah" , 
          'description' : "blah" }  , 
        
        { 'name' : "Heart Explodes from Joy",
          'further_steps' : "be grateful" , 
          'description' : "Rare event" }  
        ] , 
    
    'pulmonary' : [
        
        { 'name' : "Pulmonary Embolism" , 
          'further_steps' : 'Lower Extremity Ultrasound' , 
          'description' : "blah" } , 
        
    ]
} 



# then define the filename 
filename = "forwebapp.json" 

# and write the json data to the file 
converted_json = json.dumps(data)  #actually converets the data structure to json string 
f = open(filename, "w") 
f.write(converted_json) 
f.close()

