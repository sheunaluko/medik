"use strict";
/*
Wed Mar 18 23:58:08 2020
Sheun Aluko
@copyright sattsys

A decentralized, asynchronous, cross platform (serialized)
communication infrastructure (hyperloop)
written in typescript

*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../utils/index"));
class Client {
    constructor(ops) {
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
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `ws://${this.ops.host}:${this.ops.port}`;
            /*
            Perform the websocket connection
            */
            var WebSocket = null;
            let WS_IMPORT = yield Promise.resolve().then(() => __importStar(require("ws")));
            WebSocket = WS_IMPORT.default;
            this.log.d("Attempting connection to url: " + url);
            var ws = new WebSocket(url);
            this.conn = ws;
            //now we set the callbacks
            ws.on("open", function open() {
                this.log.d("Connection successful");
                //send a registration message now via the protocol
                this.register();
            }.bind(this));
            ws.on("message", function message(_msg) {
                let msg = JSON.parse(_msg);
                this.log.d("got message:");
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
            }.bind(this));
            ws.on("close", function close() {
                this.log.d("The ws connection was closed");
            }.bind(this));
            return this.registration_promise;
        });
    }
    handle_call(msg) {
        return __awaiter(this, void 0, void 0, function* () {
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
            if (!args) {
                args = {};
            }
            if (!args.log) {
                this.log.d("Setting logger of async handler");
                args.log = this.log;
            }
            this.log.d("Args is:");
            this.log.d(args);
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
            let result = yield fn_info.handler(args);
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
        });
    }
    handle_return_value(msg) {
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
    send(msg) {
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
    register_function(ops) {
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
    get_available_functions() {
        return __awaiter(this, void 0, void 0, function* () {
            //generate a call_id 
            let call_identifier = this.gen_call_id();
            //generate the message 
            let msg = {
                type: "list_functions",
                call_identifier,
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
        });
    }
    /*
      Allows this client to asynchronously query the hyperloop for some function call
    */
    call(ops) {
        return __awaiter(this, void 0, void 0, function* () {
            //generate the call_identifier       
            let call_identifier = this.gen_call_id();
            //build the appropriate message to call a funciton on the server side  
            let { id, args } = ops;
            //check if args has a logger 
            if (!args.log) {
                this.log.d("Setting logger of async handler");
                args.log = this.log;
            }
            let msg = {
                id,
                args,
                type: "call",
                call_identifier,
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
        });
    }
    await_registration() {
        return this.registration_promise;
    }
    gen_call_id() {
        return util.uuid();
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map