
/* 
Typescript RAM module 
for export to VCS  

Sun Mar  1 16:49:45 PST 2020
*/ 



import * as util from "../utils/index" 
import * as socksync from "../socksync/index"

var log =  util.get_logger("RAM") 


/* PARAMS */ 
let subscribe_id = "main" //see below (socksync) 
var initialized = false 
/* - - - */ 


export var RAM : object = { 
    RAM_module_load_time : new Date()  ,  
}

export type path  = string[] 
export type update_value = any  
type RAM_OBJECT = any 

export interface update { 
    path  : path ,  
    value : update_value
}


export function set(update : update)  : void { 
    /* util.update_in in will perform a nested update */ 
    util.update_in(RAM , update.path , ()=>update.value) 
    log.d(`Performed update on path ${update.path} , with value: ${update.value}`)

    /* need to broadcast the change using the socksync client */ 
    log.d("Broadcasting update via server")  
    let obj_update = util.array_update_to_object_update(update) 

    RAM_SERVER.handle_update({id: subscribe_id, data : obj_update}) 
        
}

export function get(path : path) : (RAM_OBJECT | null) {   
    /* util.get_in is helpful , will return null if dne */ 
    log.d(`Performing get on path ${path}`) 
    return util.get_in(RAM,path) 
    
}


export function on_update(obj : object ) { 
    /*
        Theoretically may not want to allow clients to 
        update the RAM... but for now will implement it 
    */
    log.d("Received update:") 
    log.d(obj) 

    //{ client only listens -> }
    //converts update in object form to array rep 
    //let update = util.object_update_to_array_update(obj) 
    //set(update)  


}


// for broadcasting state  (see below for more info) 
export var RAM_SERVER : socksync.Server 
export var RAM_CLIENT : socksync.Client  

/**
 *INIT the RAM server for dispatching updates 
 *
 * @export
 * @param {number} port
 */
export function init_server(port : number) : void{
    log.i("Initializing RAM Server")     
    RAM_SERVER = new socksync.Server({port})  
    RAM_SERVER.initialize() 

} 

export function init_client(port :number) : void{
    log.i("Initializing RAM CLIENT")
    let ops = { 
        port , 
        host : "localhost" , 
        subscribe_id , 
        on_update 
    }
    RAM_CLIENT = new socksync.Client(ops) 
    

}

/**
 *Init the RAM Module 
 *
 * @export
 * @param {number} server_port
 */
export function init(server_port : number = 9005) : void{   
    if (initialized ) { return }
    //init the server 
    init_server(server_port)  

    
    /* 
      init the local RAM Client     
      IF you would like to have access to direct 
      mirror of what other clients are seeing 
    */
    //init the client  -> 
    //init_client(server_port) 

    log.i("Async init launch complete")
    initialized = true 
}