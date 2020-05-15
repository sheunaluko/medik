# start flask app and serve the "cloud" function defined in main.py 

import flask 
from flask import Flask 
from flask import request, jsonify 

import datacommons as dc 
import json 

app = Flask(__name__) 

# CLOUD FUNCTION to perform a Google Data Commons SPARQL Query
# utilizes the DC_API_KEY env variable 
def make_response(data) : 
    response = flask.jsonify(data)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST')
    return response

@app.route('/') 
def main(): 
    response =  make_response({'error' : f'Please specify url query like this: ...url...?desired_method=args'})
    print("Got request args:")
    print(request.args)
    # The requestor would like to perform a SPARQL query
    if (request.args and 'sparql' in request.args) :
        sparql_query = request.args.get('sparql')
        print("Got query:")
        print(sparql_query)
        response = make_response(dc.query(sparql_query))
    # The requestor would like to request all triples associated with given dcids
    elif (request.args and 'triples' in request.args) :
        dcids = json.loads(request.args.get('triples'))
        print("Got dcids: ")
        print(dcids)
        #limit = dc.utils._MAX_LIMIT
        #if ('limit' in request.args)  :
        #    limit = request.args.get('limit')
        #print(f"limiting to: {limit}")
        response = make_response(dc.get_triples(dcids))

    # test endpoint for debugging
    elif request.args and 'test' in request.args :
        response = make_response({'message' : f'Test acknowledged and received data: {request.args.get("test")}' })
    else:
        pass # return_msg already set

    return response


