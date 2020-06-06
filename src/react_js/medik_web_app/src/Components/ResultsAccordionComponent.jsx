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
                key={toString(index) + "_title"}

            >
                <Icon name='dropdown' />
                {item.name}
            </Accordion.Title>
        )

        elements.push(<Accordion.Content
                        style={{color: "black"}}
                        key={toString(index) + "_1"}
                        active={this.state.activeIndex === index}>
            {item.d_dcid}
        </Accordion.Content>)

        elements.push(<Accordion.Content
                        key={toString(index) + "_2"}
                        style={{color: "black"}}
                        active={this.state.activeIndex === index}
        >
            {item.d_dcid}
        </Accordion.Content>)

        elements.push( <Accordion.Content
                         key={toString(index) + "_3"}
                        active={this.state.activeIndex === index}
        >
            associted symptoms
            {/*{item.associatedSymptoms.map((x,index) => <Label key={index}>{x.Name}</Label>)}*/}
        </Accordion.Content>)


        return elements
    }

    createWholeAccordion = () => {

        let results = []
        let items = this.props.ranking
        if (typeof items === 'undefined') {
            items = []
        }

        for (let i=0; i< items.length;i++){


            if (i >= 10){
                break
            }
            console.log(items[i])
            results = results.concat(this.createAccordionSegment(items[i], i))

        }
        return results
    }

    render() {
        const { activeIndex } = this.state
        console.log(this.props.ranking)
        return (
            <Accordion fluid styled style={{marginTop: "20px"}} >
                {this.createWholeAccordion()}
            </Accordion>
        )
    }
}

