import {ArrayOperation} from "./array_operation" 
import {IncrementOperation} from "./increment_operation" 
import {NumericOperation} from "./numeric_operation" 
import {Operation}         from "./operation" 



function _array({fn} : { fn : (arg : any[]) => any }) {
    return new ArrayOperation({fn})
}

var first_array = () => _array({fn : (x : any[]) => x[0]}) 
var last_array  = () => _array({fn : (x: any[]) => x[x.length - 1]}) 

function numeric({fn} : {fn : (...args : number []) => number}) {
    return new NumericOperation({fn})
}

function incrementor({value} : {value : string | number }) { 
    return new IncrementOperation({value}) 
}


var get = {
    array : { 
	first : first_array, 
	last : last_array,
	generic : _array , 
    } , 
    numeric, 
    incrementor, 
}

export {ArrayOperation, 
        IncrementOperation,
        NumericOperation,
        Operation,
        get , 
}
