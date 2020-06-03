import React from 'react';
import SearchComponent from "./SearchComponent"
import ResultsTableComponent from "./ResultsTableComponent"
import ResultsAccordionComponent from "./ResultsAccordionComponent"
import {Container} from 'semantic-ui-react'

const results =[
    {
        Name: "Pneumonia",
        diseaseOntologyIdentifier: "d1",
        Rank: 1,
        description: "Pneumonia is a lung infection",
        diagnostic_steps: "The first step that you do is ",
        associatedSymptoms: [
            {
                Name: "Shortness of Breath",
                medicaSubjectId: "details"
            },

        ],

    },
    {
        Name: "Myocardial infaction",
        diseaseOntologyIdentifier: "d2",
        Rank: 2,
        description: "MI",
        diagnostic_steps: "The first step that you do is ",
        associatedSymptoms: [
            {
                Name: "Shortness of Breath",
                medicaSubjectId: "details"
            },

        ],

    },
    {
        Name: "Tension Pneumothorax",
        diseaseOntologyIdentifier: "d3",
        Rank: 2,
        description: "MI",
        diagnostic_steps: "The first step that you do is ",
        associatedSymptoms: [
            {
                Name: "Shortness of Breath",
                medicaSubjectId: "details"
            },

        ],

    },

]
class SearchWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading:false,
            results:[]
        }
    }

    sendSearch = (selected) => {

        // make sure selected comforms to discussed API

        this.setState({isLoading:true})

        // util.getResults(selected).then((results) => this.setState(results, isLoading: false) )
        //

        setTimeout(function() { //Start the timer
            this.setState({isLoading: false, results:results}) //After 1 second, set render to true
        }.bind(this), 3000)
    }

    render() {
        return (
            <Container style={{margin: "10px"}}>
                < SearchComponent
                    isLoading={this.state.isLoading}
                    sendSearch={this.sendSearch}
                />
                <ResultsAccordionComponent
                    results={this.state.results}
                />
            </Container>
        );
    }
}


export default SearchWidget;
