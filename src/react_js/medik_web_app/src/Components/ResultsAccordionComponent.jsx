import React from 'react'
import { Accordion, Label, Icon} from 'semantic-ui-react'

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

export default class ResultsAccordionComponent extends React.Component {
    state = { activeIndex: 0 }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index

        this.setState({ activeIndex: newIndex })
    }

    createAccordionSegment = (item, index) => {

        let elements = []

        elements.push(
            <Accordion.Title
                active={this.state.activeIndex === index}
                index={index}
                onClick={this.handleClick}

            >
                <Icon name='dropdown' />
                {item.Name}
            </Accordion.Title>
        )

        elements.push(<Accordion.Content style={{color: "black"}} active={this.state.activeIndex === index}>
            {item.description}
        </Accordion.Content>)

        elements.push(<Accordion.Content style={{color: "black"}} active={this.state.activeIndex === index}>
            {item.diagnostic_steps}
        </Accordion.Content>)

        elements.push( <Accordion.Content active={this.state.activeIndex === index}>
            {item.associatedSymptoms.map((x,index) => <Label key={index}>{x.Name}</Label>)}
        </Accordion.Content>)


        return elements
    }

    render() {
        const { activeIndex } = this.state

        return (
            <Accordion fluid styled style={{marginTop: "20px"}} >
                {this.props.results.map((item, index) => this.createAccordionSegment(item, index))}
            </Accordion>
        )
    }
}

