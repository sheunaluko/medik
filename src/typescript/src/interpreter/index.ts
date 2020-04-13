//Fri Jul 26 18:36:38 PDT 2019
//modified for ts Sun Mar  1 11:59:31 PST 2020 

import * as ir from "./deps/interpreter_rules" 
import {TextEntityMapping} from "./deps/interpreter_rules" 
import * as it from "./deps/interpreter_targets" 
import * as iu from "./deps/interpreter_utils"  


/**
 * Parse a text string  
 *
 * @param {string} text
 * @returns
 */
export function parse(text : string) {  
    return ir.handle_text(text)    
} 


/**
 * Loads an array of rules for the interpreter. These rules map text to entities
 *
 * @export
 * @param {TextEntityMapping[]} arg
 */
export function load_rules(arg : TextEntityMapping[]) : void { 
    ir.load_rule_set(arg) 
}


/**
 * Loads the dev set of rule definitions 
 *
 * @export
 */
export function dev_rules() : void  { 
    ir.load_dev_rules() 
}

export { 
    it  , 
    ir,  
    iu, 
}


