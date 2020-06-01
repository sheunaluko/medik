import React from 'react'
import { Dropdown, Button,Grid, Segment, Loader, Dimmer, Image } from 'semantic-ui-react'
import stateOptions from './stateOptions'
//
// const stateOptions = [
//     {
//         key:1,
//         text: "Cough",
//         value: "Cough"
//     },
//     {
//         key: 2,
//         text: "Fever",
//         value: "Fever"
//     }
// ]




class DropdownExampleMultipleSearchSelection  extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading : false,
            selected:[],

        }
    }

    prepareSearch= () => {
        console.log(this.state.selected)
        this.props.sendSearch(
            this.state.selected
        )
    };

    handleChange = (e, { value }) => this.setState({ selected: value })

    render() {

        if (this.props.isLoading){
            return <Segment>
                <Dimmer active>
                    <Loader />
                </Dimmer>

                <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            </Segment>
        }


        return <Grid fluid>
            <Grid.Row >
                <Grid.Column width={13}>
                    <Dropdown
                        placeholder='Sign or Symptom'
                        fluid
                        multiple
                        search
                        selection
                        options={stateOptions}
                        onChange={this.handleChange}

                    />
                </Grid.Column>
                <Grid.Column width={3}>
                    <Button fluid size='big' onClick={this.prepareSearch}> Search</Button>

                </Grid.Column>
            </Grid.Row>
        </Grid>
    }

}

export default DropdownExampleMultipleSearchSelection
