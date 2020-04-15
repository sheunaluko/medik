import datacommons as dc 

print("Running query...") 

query_str = '''
	SELECT ?name ?dcid
	 WHERE {
	  ?a typeOf Disease .
	  ?a commonName ?name .
	 }
''' 

result = dc.query(query_str)


print("Done:") 

for r in result:
	print(r)





