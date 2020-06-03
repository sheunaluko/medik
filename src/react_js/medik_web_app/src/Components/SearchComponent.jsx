import React from 'react'
import { Dropdown, Button,Grid, Segment, Loader, Dimmer, Image } from 'semantic-ui-react'
import stateOptions from './stateOptions'

class DropdownExampleMultipleSearchSelection  extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading : false,
            selected:[],
            text:"",
            subsetOptions: [],

        }
    }

    prepareSearch= () => {

        this.props.sendSearch(
            this.state.selected
        )
    };

    handleChange = (e, { value }) => this.setState({ selected: value })
    handleSearchChange = (e, {searchQuery}) => {


        this.setState({ text: searchQuery})

    }


    changeOptions = () => {

        let subsetOptions = stateOptions.filter(d=> d["text"].match(new RegExp(this.state.text,"i")))
        let toBeAdded = []

        if (this.state.selected.length > 0 ) {

            for (let i = 0; i < this.state.selected.length; i++) {
                let elem_already_added = this.state.subsetOptions.filter( (elem) =>
                { return elem.value == this.state.selected[i]; })

                toBeAdded = toBeAdded.concat(elem_already_added)

            }

        }

        subsetOptions = subsetOptions.concat(toBeAdded)
        this.setState({subsetOptions})
    }

    render() {
        console.log(this.state.subsetOptions)
        if (this.props.isLoading){
            return <Segment>
                <Dimmer active>
                    <Loader />
                </Dimmer>

                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            </Segment>
        }



        return <Grid >
            <Grid.Row >
                <Grid.Column width={13}>
                    <Dropdown
                        placeholder='Sign or Symptom'
                        fluid
                        multiple
                        search
                        selection
                        options={this.state.subsetOptions}
                        onChange={this.handleChange}
                        onSearchChange={this.handleSearchChange}
                        text={this.state.text}
                        defaultOpen={true}
                        value={this.state.selected}

                    />
                </Grid.Column>
                <Grid.Column width={3}>
                    <Button fluid size='big' onClick={this.changeOptions}> Search terms</Button>

                    <Button fluid size='big' onClick={this.prepareSearch}> Send Query </Button>

                </Grid.Column>
            </Grid.Row>
        </Grid>
    }

}

export default DropdownExampleMultipleSearchSelection
