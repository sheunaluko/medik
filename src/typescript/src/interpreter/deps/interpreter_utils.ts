//Fri Jul 26 18:41:47 PDT 2019
//modified for ts Sun Mar  1 11:59:31 PST 2020 

import {nato} from "./nato" 
import * as util from "../../utils"

var log = util.get_logger("iu") 


export function tokenized_dictionary_replacer(opts : {
    text: string, 
    dictionary : { [key: string] : string} , 
    splitter : string, 
    joiner : string , 
}) { 
    let {text, dictionary, splitter, joiner} =  opts  
    //define the mapper function 
    let mapper = function(token : string) { 
	if (dictionary[token]) { 
	    return dictionary[token]
	} else { 
	    return token 
	} 
    }
    //map fn accross tokens and join them 
    return text.split(splitter).map(mapper).join(joiner) 
}

export type parser = (arg: string) => any 

export function nato_parser(text :string ) { 
    return tokenized_dictionary_replacer(
	    {text : text, 
	     dictionary: nato  , 
	     splitter: " ", 
	     joiner: ""}
    )
}


export function variable_value_parser(text  : string) { 
    //determines the appropriate parser and dispatches it 
    if (util.has_arithmetic(text)) { 
	log.i("Value is arithmatic expression") 
	 var result = numerical_expression_parser(text)
    } else  { 
	log.i("Value is string")
	result = text 
    }
    return result 
}

export function numerical_expression_parser(text : string ) { 
    let result = util._eval(text) 
    return result 
}


