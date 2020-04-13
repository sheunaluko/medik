import * as types from "../types.js"  
import {Operation} from "./operation.js" 
import * as res from "../resources/resource" 

type NumericOpFn = (...args : number[]) => number 
interface NumericOpArg  {
	fn :  NumericOpFn , 
	id? : string 
} 

export class NumericOperation extends Operation { 

	fn : NumericOpFn
    
	constructor({fn,id} : NumericOpArg ) { 

		let entity_id = id || "numeric_op" 
		if (!fn) { throw("Please provide fn") } 
		super({entity_id}) 
		this.fn = fn 

    }

    
    async run({resources,resource} : res.ResourceArgs) { 
	//this operation is performed on some resource 
	//it will default to retrieving the resource as types.float
	
	//defaults to only acept 1 arg 
	if (!resource) {
	    resource = resources[0] 
	} 
	
	try {  
	    
	    let type = types.core.float 
	    
	    
	    this.log.d("Requesting float type") 
	    let result = await resource.as( { type } ) 
	    
	    this.log.d("Got resource as: ") 	     
	    this.log.d(result) 
	    
	    let res_type = types.js_type(result)	    
	    this.log.d(`Type of result = ${res_type}`) 
	    
	    this.log.d("Running fn:") 	     	    
	    let value = this.fn(result) 
	    
	    this.log.d(`Got value: ${value}`) 
	    return value 
	    
	} catch (e) { 
	    
	    this.catch_error(e) 

	} 
	
    }
    
}
