import {Entity,EntityOpts} from "../entity" 
import * as types from "../types" 


export class Operation extends Entity {  

    type  = types.core.operation

    constructor(ops : EntityOpts) {  
    	super(ops) 
    }
    
}


