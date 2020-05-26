import React from 'react'
import { Dropdown, Button,Grid } from 'semantic-ui-react'

const stateOptions = [
    {
        key:1,
        text: "Cough",
        value: "Cough"
    },
    {
        key: 2,
        text: "Fever",
        value: "Fever"
    }
]

const DropdownExampleMultipleSearchSelection = () => (
    <Grid fluid>
        <Grid.Row >
            <Grid.Column width={13}>
    <Dropdown
        placeholder='Sign or Symptom'
        fluid
        multiple
        search
        selection
        options={stateOptions}
    />
            </Grid.Column>
        <Grid.Column width={3}>
                <Button fluid size='big'> Search</Button>

        </Grid.Column>
        </Grid.Row>
    </Grid>
)

export default DropdownExampleMultipleSearchSelection
