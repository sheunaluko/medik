import * as util from "../utils/index" 



/* 
   wrapper around nodejs childprocess 
*/ 

const spawn = require("child_process").spawn
const execSync  = require("child_process").execSync
const exec      = require("child_process").exec 
const log  = util.get_logger("nutil")



export function run_cmd(c : string) { 
    
    //on linux and darwin (osx)  we use /bin/bash and 
    //for windows we dont change 
    let os = process.env.VCS_OS_PLATFORM ; 
    var shell = ( os == 'darwin' || os == 'linux' ) ? "/bin/bash" : process.env.ComSpec //last one for windows see execSync DOCS
    
    try { 
	let result = execSync(c, {shell}).toString() 
	return { success : true  , result} 
    } catch (e)  { 
	return { success : false , error : e }  
    }    
}



export function run_cmd_async(cmd : string) { 
    
    //on linux and darwin (osx)  we use /bin/bash and 
    let os = process.env.VCS_OS_PLATFORM ; 
    var shell = ( os == 'darwin' || os == 'linux' ) ? "/bin/bash" : process.env.ComSpec //last one for windows see execSync DOCS
    
    var process_reference : any = null 
    
    //create a promise which will return the result upon command completion 
    var promise = new Promise( (resolve,reject) => {
	
	//create callback (inside of promise definition) 
	var callback = function(error :any, stdout : any, stderr : any) {
	    if (error) {
		//failure for some reason 
		log.i(`exec error: ${error}`);
		let result = stdout.toString() 
		resolve( {success : false , error , result } ) //resolve
		return;
	    } else { 
		let result = stdout.toString() 		    		    
		log.i(`exec success: ${stdout}`);		    
		resolve( {success : true ,  result  , stderr } ) //resolve	
	    }
	} 
	
	//now that the callback is defined we can launch the process at grab its ref 
	process_reference  = exec(cmd, {shell}, callback)	
	
    })

    return {process_reference , promise } 
}




export class generic_process { 

    pid : number | string 
    ps : any 
    log : (msg:string)=>void

    
    constructor(binary : string,out="stdout") { 
	var ps   = spawn(binary) 
	
	/* configure output */ 
	var _out   = function(msg:string) { console.log("[STD->]::\n" + msg) } 		
	ps.stdout.on("data" , _out ) 
	
	/* set member vars */ 
	this.pid   = ps.pid 
	this.ps  = ps
	this.log   = function(msg) { console.log(`[ps]::\t + ${msg}`) } 
	this.log("Created process: " + binary) 
	
	return null 
    }
    
    send_input(t : string) { 
	this.ps.stdin.write(t+"\n") 	
    }     
}

export function bash_process() { return new generic_process("bash") } 
export function python_process() { return new generic_process("python3.8") } 

export function exec_python_binary_with_text(binary : string,text : string) { return run_cmd(`${binary} -c ${text}`) } 

//checks if a given python binary is 1) working and 2) of version greater than maj.min
export function check_python_binary_version(binary : string,maj : number,min : number) {
    try { 
	let result = exec_python_binary_with_text(binary,python_version_check_string(maj,min)) 

	if (result.success) { 
	    return { success : true  } 
	} else { 
	    return { success : false , error : result.error }  
	}
	
    } catch (e)  { 
	
	//console.log("ERROR (python check):")
	//console.log(e)
	return { success : false , error : e }  
    }
}


// the command below converts a short python file string into an command executable via python -c __ 
export function convert_to_python_cmd(s : string) { return "'" +  s.trim().replace(/\s*\n\s+/g,";") + "'" } 

//for example 
export var python_version_check_string = function(maj : number,min : number) { 
    return convert_to_python_cmd(`
    import sys
    v = sys.version.split(" ")[0] 
    maj = int(v.split(".")[0])
    min = int(v.split(".")[1]) 
    print(maj >= ${maj} and min >= ${min}) 
`) 
}


