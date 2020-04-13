//Sun Mar  3 14:50:48 PST 2019 
//modified for ts Sun Mar  1 11:59:31 PST 2020 


// must support queries of this kind => 
let r1 =  "remind me to [[message-on-alarm]] in [[minutes-till-alarm]] minutes ?(from now|please)"  

export var var_regex = /\[\[(.+?)\]\]/
export var  opt_regex = /\?\((.+?)\)/   //optional includes empty string
export var OR_regex = /@or\((.+?)\)/    //OR       does not include empty string  


export interface RegexInstance  { 
    regex : string , 
    order : string[] 
}



/* 
    A set of recursive functions for parsing higher level commands into regexes 
*/ 

export function process_vars(rule : string,order : string[]) : RegexInstance {    
    let result = rule.match(var_regex)
    if (result) { 
	order.push(result[1])
	return process_vars(rule.replace(var_regex,"(.+?)"),order)
    } 
    else {
	return {regex : "^" + rule + "$", order : order}  
    }
}

export function process_optionals(rule : string) : string[] { 
    let matches = rule.match(opt_regex) 
    //console.log(matches)
    if (matches) { 
	let optionals = matches[1].split("|").concat([""])  //add the empty string as well 
	return  optionals.map( function(opt) { 
	    let next = rule.replace(opt_regex, opt)
	    //console.log(next)
	    //replace the optional in recursive fashion
	    return process_optionals(next)
    }).flat()  
    } else { 
	//normalize the spaces between tokens and trim 
	//necessary because of the way optionals are processed
	// for example with "foo ?(blah) bar" you end up with => "foo  bar" | "foo blah bar"
	return [rule.replace(/\s+/g, " ").trim()]  
    }
}

export function process_ORs(rule : string) : string[] {  
    let matches = rule.match(OR_regex) 
    //console.log(matches)
    if (matches) { 
	let ORS = matches[1].split("|")
	return ORS.map( function(OR) { 
	    let next = rule.replace(OR_regex, OR)
	    return process_ORs(next)
	}).flat() 
    } else { 
	//normalize the spaces between tokens and trim 
	// for example with "foo ?(blah) bar" you end up with => "foo  bar" | "foo blah bar"
	return [rule.replace(/\s+/g, " ").trim()]  
    }
}



/**
 * Takes a higher order rule and then parses it into an array of sever "RegexInstance" types,
 * which track a regex with capture groups and variables that should be assigned to by each capture, 
 * in order 
 *
 * @export
 * @param {string} rule
 * @returns {RegexInstance[]}  
 */
export function parse_rule(rule :string ) : RegexInstance[] { 
    return process_optionals(rule).map(process_ORs).flat().map(x=>process_vars(x,[]))
}


// must support queries of this kind => 
//let r1 =  "remind me to [[message-on-alarm]] in [[minutes-till-alarm]] minutes ?(from now|please)"  
/* 
   TO UNDERSTAND USAGE: 
   
   parse_rule(r1)  PRODUCES THE FOLLOWING: 
   
   [ { regex: '^remind me to (.+?) in (.+?) minutes from now$',
       order: [ 'message-on-alarm', 'minutes-till-alarm' ] },
     { regex: '^remind me to (.+?) in (.+?) minutes please$',
       order: [ 'message-on-alarm', 'minutes-till-alarm' ] },
     { regex: '^remind me to (.+?) in (.+?) minutes$',
       order: [ 'message-on-alarm', 'minutes-till-alarm' ] } ] 
       
*/
