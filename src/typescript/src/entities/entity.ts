import {make_logger,Logger} from "../utils/logger" 


export interface EntityOpts { 
    entity_id : string 
}


export class Entity { 
    
    log : Logger 
    
    constructor({entity_id} : EntityOpts) { 
	
	this.log = make_logger(entity_id) 

    }
    
    //for errors  
    catch_error(e : Error) {
	this.log.i("Got error:\n" + e ) 
	//will decide if I want it to throw or not ? 
	//right now they will never throw 
	//probably need to throw at some point though 
	console.error(e.stack) 	
    }
    
    describe() {
	    this.log.i("This is an entity :)")
    }
    
    
    
}

