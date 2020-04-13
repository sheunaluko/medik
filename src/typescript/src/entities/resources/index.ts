import  * as numeric from "./numeric_resource"
import * as result from "./result" 
import * as resource from "./resource" 

import * as types from "../types" 


export var get = {
    numeric : function (op : {value : string | number }) {
    	return new numeric.NumericResource(op)
    } , 
} 
 

export  { 
    numeric, 
    result, 
    resource 
}

