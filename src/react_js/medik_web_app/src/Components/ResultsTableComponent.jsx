import React from 'react'
import { Grid, Segment, List, Button} from 'semantic-ui-react'






const GridExampleStretched = () => (
    <Grid style={{margin: "10px"}}>
        <Grid.Row >
            <Grid.Column width={4} style={{color: "black"}}>

                <Button.Group  vertical>
                    <Button> Pneumonia </Button>
                    <Button>Congestive Heart Failure</Button>
                    <Button>Pnumothorax</Button>
                </Button.Group>

            </Grid.Column>

            <Grid.Column >
                <List as='ul'>
                    <List.Item as='li'>
                        Symptoms
                        <List.List as='ul'>
                            <List.Item as='li'>Cough </List.Item>
                            <List.Item as='li'>Fever</List.Item>
                            <List.Item as='li'>Short of Breath</List.Item>
                        </List.List>
                    </List.Item>

                    <List.Item as='li'>
                        Labs
                        <List.List as='ul'>
                            <List.Item as='li'>Elev WBC </List.Item>
                            <List.Item as='li'> Xray: Lung Consolidation</List.Item>
                            <List.Item as='li'>CT: Lung Consolidation</List.Item>
                        </List.List>
                    </List.Item>
                    <List.Item as='li'>
                        Labs
                        <List.List as='ul'>
                            <List.Item as='li'>Elev WBC </List.Item>
                            <List.Item as='li'> Xray: Lung Consolidation</List.Item>
                            <List.Item as='li'>CT: Lung Consolidation</List.Item>
                        </List.List>
                    </List.Item>
                </List>
            </Grid.Column>
        </Grid.Row>
    </Grid>
)

export default GridExampleStretched