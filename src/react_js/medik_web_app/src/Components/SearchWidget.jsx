import React from 'react';
import SearchComponent from "./SearchComponent"
import ResultsTableComponent from "./ResultsTableComponent"
import ResultsAccordionComponent from "./ResultsAccordionComponent"
import {Container} from 'semantic-ui-react'

function SearchWidget() {
    return (
        <Container style={{margin: "10px"}} >
            <SearchComponent />
            <ResultsAccordionComponent />
        </Container>
    );
}


export default SearchWidget;
