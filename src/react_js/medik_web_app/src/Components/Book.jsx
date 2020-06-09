import React, { useState } from "react";

import {
  Popup,
  Table,
  Loader,
  Button,
  Dimmer,
  Container,
  Divider,
  Dropdown,
  Input,
  Grid,
  Header,
  Image,
  List,
  Menu,
  Segment
} from "semantic-ui-react";

window.BOOK = {
  responses: []
};

function log(m) {
  if (m.constructor == Object || m.constructor == Array) {
    console.log("[book]::=>");
    console.log(m);
  } else {
    console.log("[book]:: " + m);
  }
}

let test_results = {
  exist: false,
  response: "infarction"
};

const Book = function() {
  var [search_state, _set_search_state] = useState(null);
  var [spinner_state, set_spinner] = useState(false);
  var [results_state, set_results] = useState(test_results);

  //export functions for global access across the app (ease of development/prototyping)
  Object.assign(window.BOOK, {
    search_state,
    results_state
    //
  });

  //define the search button handler
  let on_search_click = async function() {
    let query = document.getElementById("search_input").value;
    log("Search clicked: Value is:");
    log(query);

    //start the spinner here
    //set_spinner(true);

    //now we query   and get the results
    let response = query;

    window.BOOK.responses.push(response);
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
        <Header as="h1">Medik Step Up To Medicine Textbook Query Tool</Header>
        <p>
          Enter a query to search through the programmatically parsed text of
          Step Up To Medicine{" "}
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
        <Input
          id="search_input"
          placeholder="Enter query"
          focus
          options={null}
          style={{ width: "30%", marginRight: "2px" }}
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

export default Book;

function ResultsPanel() {
  //get results from global
  let results_state = window.BOOK.results_state;

  var [active_row, set_active_row] = useState(null);

  let msg = results_state.response; //should be the search query

  let PreResultUi = function() {
    let results = window.util.fuse_search(msg);
    return (
      <Table celled selectable style={{ width: "100%", height: "100%" }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Disease</Table.HeaderCell>
            <Table.HeaderCell>Match Score</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {results.map(s => (
            <Table.Row
              key={s.item.name}
              onMouseEnter={function(e) {
                set_active_row(s);
              }}
            >
              <Table.Cell>{s.item.name}</Table.Cell>
              <Table.Cell>{1 - s.score}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  };

  let InfoUI = function() {
    if (active_row) {
      console.log(active_row);

      let info = active_row.item.info;
      let wu = active_row.item.workup;

      return (
        <Segment style={{ width: "100%", height: "100%" }}>
          <Header as="h3">Disease Name</Header>

          <p>{active_row.item.name}</p>

          <br />

          <Header as="h3">Disease Details</Header>

          <p>{info == "" ? "None" : info}</p>

          <br />

          <Header as="h3">Disease Work Up</Header>

          <p>{wu == "" ? "None" : wu}</p>

          <br />
        </Segment>
      );
    } else {
      return (
        <Segment textAlign="center" style={{ width: "100%", height: "100%" }}>
          <Header as="h2">
            Hover over a disease to the left to display its information.
          </Header>
        </Segment>
      );
    }
  };

  return (
    <div
      style={{
        height: "70%",
        width: "98%",
        marginTop: "2em",
        marginBottom: "2em",
        padding: "15px"
      }}
    >
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "row",
          justifyContent: "space-around"
        }}
      >
        <div
          style={{
            width: "28%",
            height: "100%",
            overflowY: "scroll"
          }}
        >
          <PreResultUi />
        </div>
        <div
          style={{
            width: "68%",
            height: "100%",
            overflowY: "scroll"
          }}
        >
          <InfoUI />
        </div>
      </div>
    </div>
  );
}
