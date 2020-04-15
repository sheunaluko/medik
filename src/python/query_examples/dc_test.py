import datacommons as dc 

print("Running query...") 

query_str = '''
	SELECT ?did
	 WHERE {
	  ?a typeOf DiseaseSymptomAssociation .
	  ?a meSHID ?meshid . 
	  ?meshid name MeSH_D003371 . 
	  ?a diseaseOntologyID ?doid  . 
          ?doid description $did 
	 }
	LIMIT 10
''' 

result = dc.query(query_str)


print("Done:") 

for r in result:
	print(r)





