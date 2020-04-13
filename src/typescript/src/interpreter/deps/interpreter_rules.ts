//Fri Jul 26 19:36:36 PDT 2019
//modified for ts Sun Mar  1 11:59:31 PST 2020 

import {nato} from "./nato" 
import * as util from "../../utils"
import * as iu from "./interpreter_utils"   
import {parser}  from "./interpreter_utils"
import * as rp from "./rule_parser" 
import * as it from "./interpreter_targets" 

import {res,Entity} from "../../entities/index"

var log = util.get_logger("ir") 


/* This works like this: 
   
   The rules are expanded into regexes using the rule parser 
   The regexes are matched against the text until one matches 
   If one matches, the arguments (capure groups) are extracted from the text 
   And then the named capture groups are parsed by the correspondeding named parsers 
   Then an object is built with the capture group names as fields and the 
   parsed values as values 
   And finally the object is passed as an argument to the 'target' function 
   The target functions are stored in interpreter_targets.js 
 */

 

 export type target_fn  = (arg : object ) => Entity | void  
 export interface parsers { 
     [key : string] : parser 
 }

 /**
  * Defines the mapping between text received and ultimate resolution to an Entity 
  *
  * @interface TextEntityMapping
  */
 export interface TextEntityMapping { 
    target :   target_fn  , 
    rules : string[] 
    parsers?  : parsers 
 }

export interface TargetOp { 
    [key : string]  : any 
}

export let dev_rule_set : TextEntityMapping[] = [ 
    
    { target : ()=> new res.result.Result({value : "hey!"})  ,  
      rules : [ "test" ]  } , 

    { target : (x : TargetOp)=> new res.result.Result({value: "You said: "  + x.target }),  
      rules : [ "say [[target]]" ]  } , 
      
    { target : it["store_variable"], 
      rules  :  [ "store [[value]] @or(in|into|as) [[name]]" , 
		  "[[name]] equals [[value]]",
		  "[[name]] is equal to [[value]]" , 
		  "set [[name]] @or(to|equal to) [[value]]"] , 
      parsers:  { name : iu.nato_parser , 
		  value : iu.variable_value_parser  } } , 
    
    { target : it["get_variable"], 
      rules  :  [ "what is ?(the value of) [[name]]" , 
		  "output [[name]]" ] , 
      parsers:  { name : iu.nato_parser  } } 
    
]

export function load_rule_set(arg : TextEntityMapping[]) : void  { 
    arg.map(add_to_rule_set) 
}


export function load_dev_rules() : void { 
    load_rule_set(dev_rule_set) 
    log.i(`Total active: ${runtime_rule_set.length}`) 
}

export interface regex_info { 
    regex : string, 
    order :  string[] 
}  

export interface call_info { 
    target : target_fn , 
    parsers : parsers 
}

export interface RuntimeRule { 

    regex_info : regex_info, 
    call_info : call_info 

} 

type RuntimeRuleSet  = RuntimeRule[]
      
export var runtime_rule_set : RuntimeRuleSet  = [] 

export function add_to_rule_set(obj : TextEntityMapping) : void {  
    let {target, rules, parsers} = obj
    let regexes = rules.map(rp.parse_rule).flat() 	
    
    for (var r=0;r<regexes.length;r++) { 
	runtime_rule_set.push( { regex_info: regexes[r]  , 
				 call_info : { target, parsers } } ) 
    }
}


//default rule set   (defined above) 
//for (obj of rule_set) { add_to_rule_set(obj) }

export interface ArgBuildOps { 
    match_info : string[] ,  
    regex_info : regex_info, 
    parsers : parsers 
}

export function build_arguments(opts : ArgBuildOps) { 
    let {match_info,regex_info,parsers} = opts 
    log.i("Building argument dictionary:") 
    var dic : TargetOp = {} 
    var k = null 
    var v = null 
    let order = regex_info.order
    for (var i = 0 ; i < order.length ; i ++ ) { 
	k = order[i] 
	v = match_info[1+i]
	log.i("Adding k,v pair: " + k + "," + v)
	if (parsers && parsers[k]) {
	    log.i("Running parser for k: " + k) 
	    dic[k] = parsers[k](v) 
	} else { 
	    dic[k] = iu.variable_value_parser(v) //default to the var val parser 
	}
    } 
    log.i("Done.")
    return dic 
}


export type RuleSearchResult = null | { 
    match_info :  string[], 
    regex_info  : regex_info , 
    parsers:  parsers ,  
    target : target_fn , 
}

export function search_rules(text : string ) : RuleSearchResult {  
    for (var i =0; i< runtime_rule_set.length; i ++) { 
	let {regex_info, call_info }  = runtime_rule_set[i] 
	var match_info = text.match(regex_info.regex) 
	if (match_info) { 
	    //there was a match 
	    log.i("Found rule match: " +  regex_info.regex +  " for target " + call_info.target) 
	    let {parsers,target} = call_info 
	    return {match_info , regex_info, parsers , target}
	} else { 
	    // skip
	}
    }
    //if we got here there was no match 
    log.i("No rule match for text: " + text ) 
    return null 
} 

export function build_dispatch(opts : RuleSearchResult ) { 
    let args  = build_arguments(opts) 
    let target = opts.target 
    return {args, target} 
}

type MaybeEntity = Entity | void

export function handle_text(txt : string) : MaybeEntity  { 
    let opts = search_rules(txt) 
    if (!opts) { 
	log.i("Unrecognized text") 
	return null 
    }
    
    let {args,target} = build_dispatch(opts) 
    
    //make sure it exists 
    if (!target) { 
	log.i("Target fn not found: " + target) 
	throw("Target fn not found")
	} 
    
    return target(args)    
}
