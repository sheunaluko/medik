# start flask app and serve the "cloud" function defined in main.py 

from flask import Flask 
from flask import request

import datacommons as dc 
import json 

app = Flask(__name__) 

@app.route('/') 
def main():
    # CLOUD FUNCTION to perform a Google Data Commons SPARQL Query 
    # utilizes the DC_API_KEY env variable 
    return_msg =  f'Please specify url query like this: ...url...?desired_method=args'


    if (request.args and 'sparql' in request.args) :

        # The requestor would like to perform a SPARQL query 
        sparql_query = request.args.get('sparql') 
        return_msg = dc.query(sparql_query)

    elif (request.args and 'triples' in request.args) : 

        # The requestor would like to request all triples associated with given dcids 
        dcids = json.loads(request.args.get('triples')) 
        limit = dc.utils._MAX_LIMIT
        if ('limit' in request.args)  :  
            limit = request.args.get('limit')
            
            return_msg = dc.get_triples(dcids,limit) 
        
    elif request.args and 'test' in request.args : 
        
        return_msg = f'Test acknowledged and received data: {request.args.get("test")}' 

    else:
        
        pass # return_msg already set 

    return return_msg 

