import {NumericOperation} from "./numeric_operation.js" 


export class IncrementOperation extends NumericOperation { 

    constructor({value} : {value : string | number }) { 
	
	let id = "increment_operation"  
	let fn = function(val : number) {   
	    return val + Number(value)
	}
	super({id,fn}) 

    }

}


