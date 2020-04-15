import datacommons as dc 

print("Running query...") 

query_str = '''
	SELECT ?name ?dcid
	 WHERE {
	  ?a typeOf Place .
	  ?a name ?name .
	  ?a dcid ("geoId/06" "geoId/21" "geoId/24") .
	   ?a dcid ?dcid
	 }
''' 

result = dc.query(query_str)


print("Done:") 

for r in result:
	print(r)





