import React from 'react';
import logo from './logo.svg';
import ComponentWidget from "./Components/ComponentWidget"
import SearchWidget from "./Components/SearchWidget"
import './App.css';
import 'semantic-ui-css/semantic.min.css'

function App() {
  return (
    <div className="App">
	  
      
      <header className="App-header">
	  
        <img src={logo} className="App-logo" alt="logo" />
	  
      
        <ComponentWidget/>

        <SearchWidget />
	  
      
        <p>
          Medik version:0.1.0
        </p>
	  
      
        <a
          className="App-link"
          href="https://github.com/sheunaluko/medik" 
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
	  
      
      
      
      </header>
	  
      
    </div>
  );
}

export default App;
