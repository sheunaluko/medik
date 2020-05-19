import React from "react";
import Button from "@material-ui/core/Button";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import "./SparqlWidget.css";

var log = msg => {
  window.medik.log(msg);
};

function SparqlWidget() {
  //define function to get the query text
  var get_query = () => {
    let ta = document.getElementById("sparqlTextArea");
    return ta.value;
  };

  //
  var on_click = async () => {
    let query = get_query();
    log("Got sparql query: \n" + query);
    log("Running it...");

    let result = await window.medik.util.sparql_query(query);

    log("Query finished with result:");
    log(JSON.stringify(result));
  };

  return (
    <div className="sparqlWidget">
      <h3>SPARQL Widget</h3>

      <TextareaAutosize
        id="sparqlTextArea"
        value={textval}
        aria-label="minimum height"
        rowsMin={10}
        style={{
          marginBottom: "20px",
          fontSize: "24px",
          width: "606px",
          height: "383px"
        }}
      />

      <Button variant="contained" color="primary" onClick={on_click}>
        run
      </Button>
    </div>
  );
}

export default SparqlWidget;

let textval = `SELECT DISTINCT ?a ?oddsRatio ?dname
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
`;
