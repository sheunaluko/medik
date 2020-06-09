import React, {useState}  from 'react';
import logo from './logo.svg';
import ComponentWidget from "./Components/ComponentWidget" ;
import  HomePage from "./Components/HomePage" ;
import  Tool from "./Components/Tool" ;
import  Book from "./Components/Book" ;
import './App.css';


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



function App() {
    
    var [state, setState] = useState("HomePage")  ;
    
    let uis = { 
	HomePage : <HomePage /> , 
	Tool     : <Tool /> , 
	Book     : <Book /> , 
    } 
    
  return (
	  <div style={{display : "flex" , width : "100%" , height: "100%"}} className="App"> 
	  <Menu fixed="top" inverted size="massive">
	  
	  <Container>
          <Menu.Item as="a" onClick={()=>setState("HomePage")}>Home</Menu.Item>
          <Menu.Item as="a" onClick={()=>setState("Tool")}>Diagnosis Tool</Menu.Item>
          <Menu.Item as="a" onClick={()=>setState("Book")}>Learn</Menu.Item>	  
          <Menu.Item as="a" onClick={()=>window.open("https://github.com/sheunaluko/medik")}>Github</Menu.Item>	  
	  </Container>
	  </Menu>
	  
      { uis[state] } 
	  
      </div> 
  );
}

export default App;
