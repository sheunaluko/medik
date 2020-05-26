import React from 'react'
import { Accordion, Label, Icon} from 'semantic-ui-react'


export default class ResultsAccordionComponent extends React.Component {
    state = { activeIndex: 0 }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index

        this.setState({ activeIndex: newIndex })
    }

    render() {
        const { activeIndex } = this.state

        return (
            <Accordion fluid styled style={{marginTop: "20px"}} >
                <Accordion.Title
                    active={activeIndex === 0}
                    index={0}
                    onClick={this.handleClick}

                >
                    <Icon name='dropdown' />
                    Pneumonia
                </Accordion.Title>

                <Accordion.Content active={activeIndex === 0}>
                    <Label>
                        Cough
                    </Label>
                    <Label>
                        Fever
                    </Label>
                    <Label color='red'>
                         Xray Consolidation
                    </Label>
                    <Label color='red'>
                        Sputum culture
                    </Label>
                </Accordion.Content>

                <Accordion.Title
                    active={activeIndex === 1}
                    index={1}
                    onClick={this.handleClick}
                >
                    <Icon name='dropdown' />
                    Congestive Heart Failure
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 1}>
                    <p>
                        There are many breeds of dogs. Each breed varies in size and
                        temperament. Owners often select a breed of dog that they find to be
                        compatible with their own lifestyle and desires from a companion.
                    </p>
                </Accordion.Content>

                <Accordion.Title
                    active={activeIndex === 2}
                    index={2}
                    onClick={this.handleClick}
                >
                    <Icon name='dropdown' />
                    Tension Pneumothorax
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 2}>
                    <p>
                        Three common ways for a prospective owner to acquire a dog is from
                        pet shops, private owners, or shelters.
                    </p>
                    <p>
                        A pet shop may be the most convenient way to buy a dog. Buying a dog
                        from a private owner allows you to assess the pedigree and
                        upbringing of your dog before choosing to take it home. Lastly,
                        finding your dog from a shelter, helps give a good home to a dog who
                        may not find one so readily.
                    </p>
                </Accordion.Content>
            </Accordion>
        )
    }
}

