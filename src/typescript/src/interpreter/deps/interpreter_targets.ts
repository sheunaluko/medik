//Fri Jul 26 21:59:21 PDT 2019
//modified for ts Sun Mar  1 11:59:31 PST 2020 

import * as util from "../../utils"

var log = util.get_logger("it") 
var mem : { [key: string ] : any  } = {} 

/* 
 TODO : 
 1) actually build memory / service architecture 
 2) Create more interpreter targets here 
        - don't forget about entities too... 
*/ 

export function store_variable(opts : {name : string, value : any}) { 
    log.i("Received store request") 
    let { name, value } = opts 
    mem[name] = value 
    let msg = "Stored value into memory field " + name + " :"
    log.i(msg) 
    log.i(value) 
} 

export function get_variable(opts : {name : string}) { 
    log.i("Received get request for: " + opts.name ) 
    let value = mem[opts.name]  
    log.i(value) 
}



