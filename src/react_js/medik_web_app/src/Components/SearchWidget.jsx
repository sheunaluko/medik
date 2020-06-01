import React from 'react';
import SearchComponent from "./SearchComponent"
import ResultsTableComponent from "./ResultsTableComponent"
import ResultsAccordionComponent from "./ResultsAccordionComponent"
import {Container} from 'semantic-ui-react'

class SearchWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading:false
        }
    }

    sendSearch = (selected) => {

        this.setState({isLoading:true})


        setTimeout(function() { //Start the timer
            this.setState({isLoading: false}) //After 1 second, set render to true
        }.bind(this), 3000)
    }

    render() {
        return (
            <Container style={{margin: "10px"}}>
                < SearchComponent
                    isLoading={this.state.isLoading}
                    sendSearch={this.sendSearch}

                />
                <ResultsAccordionComponent/>
            </Container>
        );
    }
}


export default SearchWidget;
