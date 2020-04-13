import * as res from "./resource"
import * as types from "../types" 

export class NumericResource extends res.Resource {
	
	value : types.core.float 

    constructor(ops : {value : string | number}){ 
	
	ops.value = Number(ops.value) //convert to number  !
	
	var entity_id     = `numeric_res::${ops.value}` 

	// - init object 
	super({entity_id}) 

	//define the type handlers
	this.set_type_handler(types.core.float , function(){
		return (ops.value as types.core.float)
	} ) 
	
	this.value = ops.value
	//define default type 
	this.default_type = types.core.float  
    }
}


