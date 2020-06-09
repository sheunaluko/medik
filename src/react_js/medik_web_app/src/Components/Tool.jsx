import React, { useState } from "react";

import {
  Accordion,
  Popup,
  Table,
  Loader,
  Button,
  Dimmer,
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Image,
  List,
  Menu,
  Segment
} from "semantic-ui-react";

import symptoms_info from "../symptoms_updated.json";

var dcid_to_name = {};
var name_to_dcid = {};

//sort the symptoms
let symptoms_options = symptoms_info.map(function(x) {
  let name = x[0].name;
  let dcid = x[0].dcid;

  dcid_to_name[dcid] = name;
  name_to_dcid[name] = dcid;

  return {
    key: dcid,
    text: name,
    value: dcid
  };
});

symptoms_options.sort(function(a, b) {
  if (a.text < b.text) return -1;
  if (a.text > b.text) return 1;
  return 0;
});

window.SEARCH = {
  dcid_to_name,
  name_to_dcid,
  symptoms_options,
  responses: []
};

function log(m) {
  if (m.constructor == Object || m.constructor == Array) {
    console.log("[tool]::=>");
    console.log(m);
  } else {
    console.log("[tool]:: " + m);
  }
}

let test_results = {
  exist: false
  //response: JSON.parse(localStorage["test_r"])
};

const Tool = function() {
  var [search_state, _set_search_state] = useState(null);
  var [spinner_state, set_spinner] = useState(false);
  var [results_state, set_results] = useState(test_results);

  //export functions for global access across the app (ease of development/prototyping)
  Object.assign(window.SEARCH, {
    search_state,
    _set_search_state,
    spinner_state,
    set_spinner,
    results_state,
    set_results
  });

  //define the search button handler
  let on_search_click = async function() {
    let options = search_state.value; //will be array of dcids
    log("Search clicked: Options are:");
    log(options);

    //start the spinner here
    set_spinner(true);

    //now we query   and get the results
    let response = await window.util.main_symptom_lookup(options);

    set_spinner(false);
    log("Got response");
    log(response);

    let { results, ranking } = response;

    window.SEARCH.responses.push(response);
    set_results({ exist: true, response });
  };

  let set_search_state = function(s) {
    log("Setting search state: ");
    log(s);
    _set_search_state(s);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%"
      }}
    >
      <Container
        text
        textAlign="center"
        style={{ marginTop: "6em", marginBottom: "2em" }}
      >
        <Header as="h1">Medik Diagnostic Query Tool</Header>
        <p>
          {" "}
          Select a number of symptoms from the search bar below to see a list of
          suggested diagnoses, ordered by their odds ratios from Google Data
          Commons
        </p>
      </Container>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          width: "100%"
        }}
      >
        <Dropdown
          id="search_dropdown"
          placeholder="Select Symptom(s)"
          multiple
          search
          selection
          //options={[{ key: 10, value: 10, name: "Whoo" }]}
          options={symptoms_options}
          onChange={(e, data) => set_search_state(data)}
          style={{ width: "40%", marginRight: "2px" }}
        />

        <Button onClick={on_search_click}> Search </Button>

        <Loader
          style={{ marginLeft: "10px" }}
          size="medium"
          inline
          active={spinner_state}
        />
      </div>

      {results_state.exist ? <ResultsPanel /> : null}
    </div>
  );
};

export default Tool;

export function buildAccordion(x) {
  let results = window.util.fuse_search(x.name);
  //take first 5 results
  let relevant = results.slice(0, 5);

  let buildSubPanel = function(r) {
    let sub_panels = [
      { key: r.item.name + "info", title: "Information", content: r.item.info },

      { key: r.item.name + "workup", title: "Work Up", content: r.item.workup }
    ];
    return <Accordion.Accordion panels={sub_panels} />;
  };

  let buildPanelObject = function(r) {
    return {
      key: r.item.name,
      title: r.item.name,
      content: {
        content: buildSubPanel(r)
      }
    };
  };

  let panels = relevant.map(buildPanelObject);

  return (
    <div style={{ marginTop: "0px" }}>
      <a href={"http://browser.datacommons.org/kg?dcid=" + x.d_dcid}>
        Data Commons Link
      </a>

      <h4>Potential Step Up 2 Medicine Matches</h4>
      {results.length > 0 ? <Accordion panels={panels} styled /> : <p>None</p>}
    </div>
  );
}

function ResultsPanel() {
  //get results from global
  let results_state = window.SEARCH.results_state;

  let { ranking, results } = results_state.response;

  let symptom_dcids = Object.keys(results);

  let RankingArea = function(ranking) {
    return (
      <Segment style={{ height: "100%", margin: "5px" }}>
        <div
          style={{
            overflow: "scroll",
            height: "100%"
            //            padding: "3px"
          }}
        >
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Rank</Table.HeaderCell>
                <Table.HeaderCell>Diagnosis</Table.HeaderCell>
                <Table.HeaderCell>Matching Symptoms</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {ranking.map(x => (
                <Table.Row key={x.rank}>
                  <Table.Cell>{x.rank}</Table.Cell>
                  <Table.Cell>
                    <Popup
                      content={buildAccordion(x)}
                      trigger={<p>{x.name}</p>}
                      hoverable
                      offset="250px, 0px"
                      position="top left"
                      basic
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {x.associated_symptoms.map(x => dcid_to_name[x]).join(", ")}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Segment>
    );
  };

  let ResultArea = function(dcid) {
    let rs = results[dcid];
    return (
      <Segment
        key={dcid}
        style={{
          height: "100%",
          margin: "5px",
          paddingBottom: "20px",
          minWidth: "50%"
        }}
      >
        {dcid_to_name[dcid]}
        <div style={{ overflow: "scroll", height: "100%", padding: "3px" }}>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Diagnosis</Table.HeaderCell>
                <Table.HeaderCell>Odds Ratio</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {rs.map(x => (
                <Table.Row key={x.dsa_dcid}>
                  <Table.Cell>{x.dname}</Table.Cell>
                  <Table.Cell>{x.or}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Segment>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        width: "100%",
        height: "70%",
        padding: "10px"
      }}
    >
      <Segment
        vertical
        style={{
          margin: "6em 0em 0em",
          width: "48%",
          height: "100%"
        }}
        textAlign="center"
      >
        <Header as="h2">Diagnosis Ranking</Header>
        <Container textAlign="center" style={{ height: "100%" }}>
          {RankingArea(ranking)}
        </Container>
      </Segment>

      <Segment
        vertical
        style={{
          margin: "6em 0em 0em",
          padding: "2em 0em",
          width: "48%",
          height: "100%"
        }}
        textAlign="center"
      >
        <Header as="h2">Results By Symptom</Header>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "row",
            width: "100%",
            overflowX: "scroll",
            overflowY: "hidden"
          }}
        >
          {symptom_dcids.map(dcid => ResultArea(dcid))}
        </div>
      </Segment>
    </div>
  );
}
