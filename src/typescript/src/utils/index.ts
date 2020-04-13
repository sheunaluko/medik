import * as logger from "./logger" 
import {Logger} from "./logger" 

import { v4 as uuidv4 } from 'uuid';
import { transformFile } from "babel-core";



/**
 * Returns a logger instance 
 *
 * @export
 * @param {string} name
 * @returns 
 */
export function get_logger(name : string) {  
	return logger.make_logger(name)  
}



function string_contains_any(val :string,arr : string[]) { 
    let ret = false
    for (let i of arr) { 
		var res = (val.indexOf(i) > -1 ) 	
		ret = ret || res
    }
    if (ret) { return true } else {return false } 
}

let arithmetic_ops = ['+' , '-' , '/' , '*' ]




/**
 * Checks if a string has any arithmetic operations in it 
 *
 * @export
 * @param {*} text
 * @returns {Boolean}
 */
export function has_arithmetic(text : string) : Boolean { 
    return string_contains_any(text,arithmetic_ops) 
}





/**
 * Unsafe nodejs evaluation 
 * 
 * @export
 * @param {string} text
 * @returns {*}
 */
export function _eval(text : string) : any  {   
	return eval(text)  
}
 


/**
 * Returns last element of an array 
 *
 * @export
 * @param {any[]} arg
 * @returns {*}
 */
export function last(arg : any[]) : any{ 
  let len = arg.length ; 
  return arg[len-1] 
}




/**
 * Updates an object at the specified (nested?) path using the specified function. The function will operate on the existing value and the returned value will be set as the new value
 *
 * @export
 * @param {{[k: string] : any}} obj
 * @param {string[]} path
 * @param {(arg: any) => any} fn
 */
export function update_in(obj: {[k: string] : any} , path : string[] , fn : (arg: any) => any) : void { 

  var tmp = obj 

  //traverse the path 
  for (var i =0 ; i< path.length - 1 ; i ++ ) { 
    
    //If the path does not exist we create it 
    if ( !tmp[path[i]] ) {   tmp[path[i]] = {} }  

    //then traverse one level 
		tmp = tmp[path[i]] 
  } 

  //get the leaf  
  let key = (last(path) as string)
  let leaf : any = tmp[key]    

  //operate on the leaf 
  let result  = fn(leaf)  

  //and then we update the object at that leaf 
  tmp[key]  = result 

  //do not return anything (modify object in place)
  
}


/**
 * Get nested path in an object using path = string[] (if it exists) 
 *
 * @export
 * @param {{[k: string] : any}} obj
 * @param {string[]} path
 * @returns {*}
 */
export function get_in(obj: {[k: string] : any} , path : string[] ): any { 
  
  var tmp = obj 

  //traverse the path (note i range is larger than update_in)
  for (var i =0 ; i< path.length  ; i ++ ) { 
    
    //If the path does not exist we return null  
    if ( !tmp[path[i]] ) {   return null }   

    //traverse one level 
		tmp = tmp[path[i]] 
  }  

  return tmp 

}

interface s_dic  {[k:string] : any} 
interface array_object_update { 
  path : string[] , 
  value : any 
}
interface dictionary_object_update { [k:string] : any  } 

/**
 * Converts an Object UPDATE TYPE from array form (path with value) to object form (nested object 
 * Useful for working with socksync  
 *
 * @export
 * @param {array_object_update} array_update
 * @returns {dictionary_object_update}
 */
export function array_update_to_object_update(array_update: array_object_update) : dictionary_object_update  {   

  let {path , value } = array_update
  var tmp : s_dic  = {} 

  //traverse the path 
  for (var i =0 ; i< path.length - 1 ; i ++ ) { 
    //build the key 
    tmp[path[i]] = {}  
    //then traverse one level 
		tmp = tmp[path[i]] 
  } 

  //assign the leaf  
  let key = (last(path) as string)
  tmp[key]  = value 

  //return 
  return tmp 
  
}
 

export function object_update_to_array_update(obj : dictionary_object_update) : array_object_update { 
  var path :  string[] = []  

  var tmp = obj ;  

  var done = false 

  while ( tmp.constructor == Object ) {  
    var ks  = Object.keys(tmp)   

    if (ks.length != 1 )  { 
      //will assume that the current object should be returned 
      break 
    } else { 
      path.push(ks[0]) 
      tmp = tmp[ks[0]] 
    }
  }

  return { path , value : tmp} 
}


export function ms() { 
  return new Date().getTime() 
}
 

export function sets_equal<T>(as : Set<T>,bs: Set<T>) {  
      if (as.size !== bs.size) return false;
      for (var a of as) if (!bs.has(a)) return false;
      return true;
}

export function set<T>(...args : T[] ) : Set<T> { 
    return new Set(args) 
}

export {Logger } 






/* 

Funcitonal style patterns (inspired by clojure)

*/ 



/**
 * Parition a list of things into sub lists each of length 'num' 
 *
 * @export
 * @template T
 * @param {T[]} thing
 * @param {number} num
 * @returns
 */
export function partition<T>(thing : T[],num : number) {  
  var result = [] 
  var current_sub_array = [] 
  for (var i = 0 ; i < thing.length ; i ++ ) { 

    if ( (i+1) % num == 0 && i !=0  ) { 
      current_sub_array.push(thing[i]) 
      result.push(current_sub_array)  
      current_sub_array = [] 
    }  else { 
      current_sub_array.push(thing[i]) 
      if (i == thing.length - 1) {//end
        result.push(current_sub_array)
      }
    }

  }

  return result 
    
}


export function uuid() {
  return uuidv4()
}


/* 
 source from: https://gist.github.com/kethinov/6658166 
*/ 
var path = require('path')
var fs = require('fs')

export var walkSync = (dir :string, filelist :any  = []) => {
  fs.readdirSync(dir).forEach((file :string) => { 

    let name = path.join(dir, file) 
    let basename = path.basename(name) 
    let prefix = basename.substring(0,2)
    
    if(prefix == ".#") { return }  //ignore the emacs hidden files (threw errors)

    filelist = fs.statSync(name).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));

  });
return filelist;
}


export function rec_find_dir_ext(dir :string, ext: string) { 
  return  walkSync(dir).filter( (file:string) => ( file.substr(-1*(ext.length+1)) == '.' + ext ) )

}


/* 
STRINGS
*/ 

export function str_empty(s : string) {  
  return s == '' 
}

export function str_not_empty(s : string) { 
  return !str_empty(s) 
}

export function trim(s: string) { 
  return s.trim()
}

export function char_replacer(c : string,rep :string) { 
  return function(s : string) { 
      return s.replace(new RegExp(c,'g'),rep) 
  }
}

export function char_remover(c : string) { 
  return char_replacer(c,"") 
}