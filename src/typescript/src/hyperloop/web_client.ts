/* 
Wed Mar 18 23:58:08 2020
Sheun Aluko 
@copyright sattsys  

A decentralized, asynchronous, cross platform (serialized)
communication infrastructure (hyperloop) 
written in typescript 

*/

import * as util from "../utils/index";
//import WebSocket from "ws";
declare var window: any;

/* 
 WEB CLIENT IMPLEMENTATION  
*/

/* 
    workflow: 
    let c = new client() 

    await c.connect({id : "meh"})  //will connect and register 
    await c.register_function({id: f_id, args_info, handler : some_handler})

    client must also handler "calls" after it registers 
    client.on("call", function(data) => {} )
    //must return a msg that has type: "return_value" which 
    //includes the call_identifier

    OR 

    let c2 = new client() 
    let result = c2.call({id: "meh", data : {default : 10}}) 
*/

interface ClientOps {
  host: string;
  port: string | number;
  id: string;
}

interface CallFunctionOps {
  id: string;
  args: { [k: string]: any };
}

interface RegisterFunctionOps {
  id: string;
  handler: (args: { [k: string]: any }) => any;
  args_info: any[];
}

export class Client {
  ops: ClientOps;
  conn: any;
  log: util.Logger;
  connection_url: string;

  function_table: { [k: string]: any };
  lobby: { [k: string]: any }; //for async call_identifiers

  registration_promise: Promise<string>;
  fullfill_registration: () => any;

  constructor(ops: ClientOps) {
    this.ops = ops;
    this.log = util.get_logger("hlc_" + ops.id);
    //initialize objects
    this.lobby = {};
    this.function_table = {};
    this.conn = null;

    //registration promise will be set in connect and can be awaited for better async
    var fullfill_registration = null;
    this.registration_promise = new Promise((resolve, reject) => {
      fullfill_registration = resolve;
    });
    this.fullfill_registration = fullfill_registration; //get copy so we can resolve later
  }

  async connect() {
    this.log.d("!!!");
    let url = `ws://${this.ops.host}:${this.ops.port}`;

    /* 
        Perform the websocket connection 
        */

    var WebSocket: any = null;
    WebSocket = window.WebSocket;

    this.log.d("Attempting connection to url: " + url);
    var ws = new WebSocket(url);

    this.conn = ws;
    //now we set the callbacks
    ws.onopen = function open() {
      this.log.d("Connection successful");
      //send a registration message now via the protocol
      this.register();
    }.bind(this);

    ws.onmessage = function message(event: any) {
      let _msg = event.data;
      if (!_msg) {
        return;
      }

      this.log.d("got message:");
      this.log.d(_msg);
      let msg = JSON.parse(_msg);

      this.log.d("Parsed:");
      this.log.d(msg);

      switch (msg.type) {
        case "call":
          this.handle_call(msg);
          break;

        case "registered":
          this.log.d("Received registered ack");
          this.fullfill_registration("REG COMPLETE");

          break;

        case "return_value":
          this.handle_return_value(msg);
          break;

        default:
          this.log.d("Unrecognized message type:");
          this.log.d(message);
      }
    }.bind(this);

    ws.onclose = function close() {
      this.log.d("The ws connection was closed");
    }.bind(this);

    return this.registration_promise;
  }

  async handle_call(msg: { args: any; call_identifier: string; id: string }) {
    this.log.d("Received call request");
    /* 
         Lookup the function in the function table 
         and run it with the given args  asyncrhonously, 
         and after the return value is retrieved then 
         we send a message back with the type "return_value" 
         and fields call_identifier, data 
        */

    let { args, call_identifier, id } = msg;
    let fn_info = this.function_table[id];

    //check if args has a logger
    if (!args) { args = {} } 
    if (!args.log) {
      this.log.d("Setting logger of async handler");
      args.log = this.log;
    }

    var _msg = null;

    if (!fn_info) {
      //for some reason the function does not exist
      _msg = {
        data: {
          error: true,
          reason: "endpoint_reported_no_exist"
        },
        call_identifier,
        type: "return_value"
      };

      this.send(_msg);
      this.log.d("Could not find so sent error");
      return;
    }

    //the function does exist... in this case we async it
    //then
    this.log.d("Running handler");
    let result = await fn_info.handler(args);
    this.log.d("Got result: ");
    this.log.d(result);
    _msg = {
      data: {
        error: false,
        result
      },
      call_identifier,
      type: "return_value"
    };

    this.log.d("Sending result to hub:");
    this.log.d(_msg);
    this.send(_msg);
  }

  handle_return_value(msg: { call_identifier: string; data: any }) {
    /* 
        We have in the past called await call(...) 
        and we will be retrieving return info here

        1st we check the LOBBY for the call_identifier,
        then we RESOLVE the associated promise 
        */

    this.log.d("Got return value: ");
    this.log.d(msg);

    let { call_identifier, data } = msg;
    let { promise, promise_resolver } = this.lobby[call_identifier];
    promise_resolver(data);
    this.log.d("Resolved promise with returned data");
    //clean
    this.lobby[call_identifier] = undefined;
  }

  send(msg: object) {
    if (!this.conn) {
      throw "Ws connection has not been initialized";
    }
    this.conn.send(JSON.stringify(msg));
  }

  register() {
    let msg = {
      type: "register",
      id: this.ops.id || "anon"
    };
    this.send(msg);
    this.log.d("Sent register message:\n" + JSON.stringify(msg));
  }

  register_function(ops: RegisterFunctionOps) {
    //add the id to the LOCAL function table
    //build a register request object and send it
    let { id, args_info, handler } = ops;
    let msg = {
      id,
      args_info,
      type: "register_function"
    };

    this.send(msg);
    this.log.d("Sent register function message");
    this.log.d(msg);

    //update the function table
    this.function_table[id] = { args_info, handler };
    this.log.d("Added function to local function table");
    this.log.d(this.function_table);
  }

  async get_available_functions() {
    //generate a call_id
    let call_identifier = this.gen_call_id();
    //generate the message
    let msg = {
      type: "list_functions",
      call_identifier
    };

    this.send(msg);
    this.log.d("Sent list_functions request");
    this.log.d(msg);

    //create the promise we will return
    //and get out a reference to its resolver
    var promise_resolver = null;
    let promise = new Promise((resolve, reject) => {
      promise_resolver = resolve;
    });

    //update the lobby since we will be waiting for a response
    this.lobby[call_identifier] = { promise, promise_resolver };
    this.log.d("Updated lobby to await async response");

    //return the promise
    return promise;
  }

  /* 
    Allows this client to asynchronously query the hyperloop for some function call 
  */

  async call(ops: CallFunctionOps) {
    //generate the call_identifier
    let call_identifier = this.gen_call_id();

    //build the appropriate message to call a funciton on the server side
    let { id, args } = ops;

    let msg = {
      id,
      args,
      type: "call",
      call_identifier
    };

    //create a promise and promise resolver
    var promise_resolver = null;
    var promise = new Promise((resolve, reject) => {
      promise_resolver = resolve;
    });

    //store  the promise resolver under the the call_identifier in the lobby
    this.lobby[call_identifier] = { promise, promise_resolver };

    //send the message
    this.send(msg);

    //return the promise
    return promise;
  }

  await_registration() {
    return this.registration_promise;
  }

  gen_call_id() {
    return util.uuid();
  }
}
