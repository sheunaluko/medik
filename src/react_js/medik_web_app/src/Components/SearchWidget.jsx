import React from 'react';
import SearchComponent from "./SearchComponent"
import ResultsAccordionComponent from "./ResultsAccordionComponent"
import {Container} from 'semantic-ui-react'

// const results =[
//     {
//         Name: "Pneumonia",
//         diseaseOntologyIdentifier: "d1",
//         Rank: 1,
//         description: "Pneumonia is a lung infection",
//         diagnostic_steps: "The first step that you do is ",
//         associatedSymptoms: [
//             {
//                 Name: "Shortness of Breath",
//                 medicaSubjectId: "details"
//             },
//
//         ],
//
//     },
//     {
//         Name: "Myocardial infaction",
//         diseaseOntologyIdentifier: "d2",
//         Rank: 2,
//         description: "MI",
//         diagnostic_steps: "The first step that you do is ",
//         associatedSymptoms: [
//             {
//                 Name: "Shortness of Breath",
//                 medicaSubjectId: "details"
//             },
//
//         ],
//
//     },
//     {
//         Name: "Tension Pneumothorax",
//         diseaseOntologyIdentifier: "d3",
//         Rank: 2,
//         description: "MI",
//         diagnostic_steps: "The first step that you do is ",
//         associatedSymptoms: [
//             {
//                 Name: "Shortness of Breath",
//                 medicaSubjectId: "details"
//             },
//
//         ],
//
//     },
//
// ]
class SearchWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading:false,
            results:{},
            ranking: [],
            hasResultsChanged: 1
        }
    }

    sendSearch = (selected) => {

        // make sure selected comforms to discussed API

        this.setState({isLoading: true})

        // util.getResults(selected).then((results) => this.setState(results, isLoading: false) )

        window.medik.util.main_symptom_lookup(selected).then(results => {
            console.log(results)

            this.setState({
                ranking: results.ranking,
                //results: results.results,
                isLoading: false
            })


        })

    }

    render() {
        return (
            <Container style={{margin: "10px"}}>
                < SearchComponent
                    isLoading={this.state.isLoading}
                    sendSearch={this.sendSearch}
                    hasResultsChanged={this.state.hasResultsChanged}
                />
                <ResultsAccordionComponent
                    results={this.state.results}
                    ranking={this.state.ranking}
                />
            </Container>
        );
    }
}


export default SearchWidget;
