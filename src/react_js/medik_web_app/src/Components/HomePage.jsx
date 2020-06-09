import React from "react";
import {
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Image,
  List,
  Menu,
  Segment
} from "semantic-ui-react";

var team = [
  { name: "Emily Guthrie", pic: "pics/emily.png" },
  { name: "Sheun Aluko", pic: "pics/shay.jpeg" },
  { name: "Sarah Dobbins", pic: "pics/sarah.png" },
  { name: "Gustavo Chavez", pic: "pics/gustavo.jpeg" }
];

const HomePage = () => (
  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
    <Container
      text
      textAlign="center"
      style={{ marginTop: "6em", flexGrow: 1 }}
    >
      <Header as="h1">Medik: A Clinical Diagnostic Educational Tool</Header>
      <p> Powered by Google Data Commons </p>
      <Header as="h2">Abstract</Header>
      <p> {abstract_text} </p>
    </Container>

    <Segment
      inverted
      vertical
      style={{ margin: "5em 0em 0em", padding: "5em 0em" }}
    >
      <Container textAlign="center">
        <Grid divided inverted stackable>
          <Grid.Column width={4}>
            <Header inverted as="h4" content={team[0].name} />
            <Image src={team[0].pic} circular size="small" centered={true} />
          </Grid.Column>
          <Grid.Column width={4}>
            <Header inverted as="h4" content={team[1].name} />
            <Image src={team[1].pic} circular size="small" centered={true} />
          </Grid.Column>
          <Grid.Column width={4}>
            <Header inverted as="h4" content={team[2].name} />
            <Image src={team[2].pic} circular size="small" centered={true} />
          </Grid.Column>
          <Grid.Column width={4}>
            <Header inverted as="h4" content={team[3].name} />
            <Image src={team[3].pic} circular size="small" centered={true} />
          </Grid.Column>
        </Grid>

        <Divider inverted section />
        <List horizontal inverted divided link size="small">
          <List.Item as="a" href="#">
            Biomedin 212
          </List.Item>
          <List.Item as="a" href="#">
            Stanford University Biomedical Informatics
          </List.Item>
          <List.Item as="a" href="#">
            2020
          </List.Item>
        </List>
      </Container>
    </Segment>
  </div>
);

export default HomePage;

let abstract_text =
  "Recent estimates implicate diagnostic error as a factor in 10% of patient deaths and up to 17% of hospital adverse events. The number of novel medical studies and publications increases substantially each year, but traditional information systems have not kept pace. As a result, Americans receive only about half of recommended care. Education of medical students is critical for improving outcomes through accurate and timely diagnosis. Students need access to the most up-to-date information when learning to make diagnostic decisions. The available online diagnostic tools require subscriptions to access in full and do not disclose all of their data sources. Thus, users cannot be certain if the diagnostic information presented represents the latest findings. An effective diagnostic education tool must overcome significant barriers including synthesis of complex factors in diagnosis and interaction with medical knowledge databases and scientific study repositories. Recent advances in availability of Application Programming Interfaces (APIs) to query medical knowledge databases and novel web-based technology stacks provide the necessary combination to build a modern diagnostic education tool with these capabilities. Our team of senior medical students, bioinformaticians, and software developers has the expertise to develop this interactive tool. First, we will establish a method for programmatically querying the Google Data Commons medical knowledge database to rank likely diagnoses given symptom keywords. The diagnostic ranking will be computed by an algorithm using the magnitude of the association odds ratio. Second, with the React Javascript Framework, we will build a web application focused on education that takes a list of symptoms as an input and displays a ranked list of diagnoses. This software will provide medical students with a critical tool for improving their diagnostic knowledge, based on the most up-to-date research, therefore improving patient care and outcomes.";
