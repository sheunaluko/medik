

import * as RAM from "../ram/index" 

//init the ram 
RAM.init() 

//params 
const rate = 2000

//and create a loop to update the RAM server 
var counter : number = 0 

//


setInterval( function() { 
    //let p = "path_" + counter    
    RAM.set({
        path : ["counter"] , 
        value : counter++ , 
    })
}, rate) 
