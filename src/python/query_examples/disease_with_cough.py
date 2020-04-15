import datacommons as dc 

print("Running query...") 



query_str = '''
	SELECT  ?dcid ?meshid
	 WHERE {
	  ?a typeOf DiseaseSymptomAssociation . 
	  ?a meSHID ?meshid 
	 }
	LIMIT 20 
''' 

result = dc.query(query_str)


print("Done:") 

for r in result:
	print(r)





