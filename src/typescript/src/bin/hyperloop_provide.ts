import { Server } from "../hyperloop/hub";
import { Client } from "../hyperloop/client";

import * as nutil from "../node_utils/index";
import { parse } from "src/interpreter";

/* 
    Script for starting a hyperloop server, as well as preloading the hub with 
    several functions (defined in 'to_register' below)


    API 
        - just add a new object to the "to_register" array :) 
        - provide an id, (async) handler, and optional args_info 
        - all registered functions will be available to all hyperloop clients , 
          and the hyperloop hub will be ready to receive connections at ws:127.0.0.1:${port=9011}
        - clients can discover functinality by calling await list_functions() 
*/

let to_register = [
  {
    id: "sattsys.hyperloop.covid_19_us",
    handler: async function() {
      let d = JSON.parse(nutil.run_cmd("get_covid_us_data").result.trim());
      return d;
    },
    args_info: [] as any[]
  } , 
  { 
      id : "sattsys.hyperloop.traceroute" , 
      handler : async function(args : {url : string , log : any}) { 
          /*  
          TODO - 
            [x] implement this using traceroute wrapper
            [x] integrate browser client hyperloop into vcs 
                react ui
                    - auto connect and attach to vcs obj
            [x] create globe widget which has url input and submit 
                button then async calls traceroute hyperloop and 
                plots the arcs 
            [ ] globe widget as above but covid 19 data showing US 
           */ 
          
          //first we get the string output 
          let result_string = nutil.run_cmd(`traceroute -I ${args.url}`).result 
          args.log.d("Retrieved the result string: ") 
          args.log.d(result_string) 
          
          /* 
          trace route row looks like this: 
          '1  www.routerlogin.com (192.168.1.1)  3.348 ms  0.977 ms  1.516 ms'
          */ 
          let parse = function(row_string : string ) { 
                let toks = row_string.split(/\s+/)  
                let [hop_number, domain, ip, t1 , ms1 , t2 , ms2 , t3 , ms3 ] = toks  

                let parsed = { 
                    hop_number, domain, 
                    ip : ip.replace("(","").replace(")","")  , 
                    t1, ms1, t2, ms2, t3, ms3 
                }

                return parsed 
          }

          //then we are going to parse it 
          let data = result_string.trim().split("\n").map((x:string)=> parse(x.trim())) 

          args.log.d("Sending the resulting data: ") 
          args.log.d(data) 

          return data 


          
      }, 
      args_info : [ ["url" , "string"]] 
  } , 
  { 
      id :  "sattsys.hyperloop.dnslookup" , 
      handler : async (args : {domain : string, log : any})=> {
          /* by the way, nslookup output looks like this: 

          Server:         192.168.1.1
          Address:        192.168.1.1#53

          Non-authoritative answer:
          www.cnn.com     canonical name = turner-tls.map.fastly.net.
          Name:   turner-tls.map.fastly.net
          Address: 151.101.53.67

        */
        let {domain, log}  = args 
        log.d("Doing dns query")   
        let result = await nutil.run_cmd(`nslookup ${domain}`).result
        var ip = null 

        try {
             ip = result.trim().split("\n").slice(-1)[0].split(" ")[1] //lol 
             log.d("Successfully parsed ip")
        } catch (e) { 
            log.d("error attempting to parse result:") 
            log.d(result) 
            log.d("Will return null ip") 
        }
        
        return ip 

       }, 
      args_info : [["ip" , "string"]] 
  } ,   
  { 
      id :  "sattsys.hyperloop.geolocate_ip" , 
      handler : async (args : {ip : string, log : any})=> { 
          let {log, ip } = args 
          log.d("Geolocating ip: "+ ip)
          let result = (await nutil.run_cmd(`ip_info ${ip}`)).result
          return JSON.parse(result) 
       }, 
      args_info : [["ip" , "string"]] 
  } , 
];

let port = 9011;

let sops = {
  port
};

//now we create a producing client
let cops = {
  host: "localhost",
  port,
  id: "sattsys.client_0"
};

async function init() {
  //create the hyerloop hub
  let hl_server = new Server(sops);

  //initiate it .
  hl_server.initialize();

  let provider = new Client(cops);
  await provider.connect();

  //register the functions 
  to_register.map((r: any)=> provider.register_function(r) )  

}

init();
