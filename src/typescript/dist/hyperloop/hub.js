"use strict";
/*
Wed Mar 18 23:58:08 2020
Sheun Aluko
@copyright sattsys

A decentralized, asynchronous, cross platform (serialized)
communication infrastructure (hyperloop)
written in typescript

*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const util = __importStar(require("../utils/index"));
class Server {
    constructor(ops) {
        this.ops = ops;
        this.log = util.get_logger("hl_hub");
        this.clients_by_id = {};
        this.function_table = {};
        this.lobby = {};
    }
    initialize() {
        let port = this.ops.port;
        var wss = new ws_1.default.Server({ port });
        //create the callbacks now
        wss.on("connection", function connection(ws) {
            //cannot really do anything until we know what the subscribe id is
            this.log.d("A client connected from ip " + ws._socket.remoteAddress);
            ws.on("message", function incoming(message_string) {
                var msg = JSON.parse(message_string);
                switch (msg.type) {
                    /*
                        Allow a client to register with a unique ID
                    */
                    case "register":
                        this.register(msg, ws);
                        break;
                    /*
                        Allows a client to register functionality (a function) with the hub
                        */
                    case "register_function":
                        this.register_function(msg, ws);
                        break;
                    /*
                      Allows a client to request a function call from the hub
                     */
                    case "call":
                        this.call_function(msg, ws);
                        break;
                    /*
                      Allows a client to RETURN a function return value to the hub
                      (after it has been called)
                    */
                    case "return_value":
                        this.return_value(msg, ws);
                        break;
                    /*
                      Requests from the hub a description of all functions available
                      through it
                    */
                    case "list_functions":
                        this.list_functions(msg, ws);
                        break;
                    default:
                        this.log.d("Unrecognized message type:");
                        this.log.d(msg);
                }
            }.bind(this));
            ws.on("close", function close() {
                this.handle_close({ ws });
            }.bind(this));
        }.bind(this));
        // - end callbacks
        this.log.d("wss listening on port: " + port);
        this.server = wss;
    }
    /*
      Allows a client  register with a unique ID
     */
    register(msg, ws) {
        let id = msg.id;
        this.log.d("Received register request from:" + id);
        this.log.d("Saving client");
        this.clients_by_id[id] = ws;
        this.log.d("Appending id to ws instance data");
        ws.hyperloop_id = id;
        //send ack 
        this.acknowledge_register(ws);
    }
    /*
      Allows a client to register functionality (a function) with the hub
     */
    register_function(msg, ws) {
        let id = msg.id;
        this.log.d("Received register FUNCTION request from:" + ws.hyperloop_id);
        this.function_table[id] = {
            provider: ws,
            id,
            args_info: msg.args_info,
            provider_id: ws.hyperloop_id,
        };
        this.log.d("Updated function table with id: " + id);
        this.log.d("Args Info was: ");
        this.log.d(msg.args_info);
    }
    /*
      Allows a client to request a function call from the hub
     */
    call_function(ops, ws) {
        let { id, args, call_identifier } = ops;
        this.log.d("Recieved request to call function from:" + ws.hyperloop_id);
        this.log.d("Request:");
        this.log.d(ops);
        let function_info = this.function_table[id];
        //maybe there is no function in the table 
        if (!function_info) {
            this.reply_no_function(ws, call_identifier);
            return;
        }
        //the function DOES EXIST   -- 
        //configure the lobby so that the function return value will be handled 
        //appropriately 
        this.lobby[call_identifier] = {
            requesting_client: ws,
            requesting_client_id: ws.hyperloop_id,
        };
        this.log.d("Updated lobby for client reply");
        //then shoot off the request 
        let msg = {
            id,
            args,
            call_identifier,
        };
        this.send_call_request(function_info.provider, msg);
        this.log.d("Sent call request to client: ");
        this.log.d(msg);
    }
    /*
      Allows a client to RETURN a function return value to the hub
      (after it has been called)
    */
    return_value(ops, ws) {
        let { call_identifier, data } = ops;
        this.log.d("Got return value from: " + ws.hyperloop_id);
        this.log.d(ops);
        this.log.d("looking for call_identifier");
        let requesting_client_info = this.lobby[call_identifier];
        if (!requesting_client_info) {
            this.log.d("Could not find any curreny associated call_identifier!");
            //do nothing with the value for now 
            return;
        }
        //found some client 
        let { requesting_client, requesting_client_id } = requesting_client_info;
        this.log.d(`Will return data to requesting client: ${requesting_client_id}`);
        let msg = {
            type: "return_value",
            call_identifier,
            data,
        };
        this.send_msg(msg, requesting_client);
        this.log.d("Send the requesting client the data");
        this.log.d("Cleaning state:");
        this.log.d("clearing lobby: " + call_identifier);
        this.lobby[call_identifier] = undefined;
    }
    /*
      Requests from the hub a description of all functions available
      through it
     */
    list_functions(ops, ws) {
        let { call_identifier } = ops;
        this.log.d("Got request to list_functions");
        this.log.d(ops);
        //get the current list of all functions 
        //as well as their associated args_info 
        let fn_ids = Object.keys(this.function_table);
        let data = fn_ids.map(f_id => {
            let { args_info } = this.function_table[f_id];
            return {
                args_info,
                id: f_id
            };
        });
        let msg = {
            type: "return_value",
            data,
            call_identifier,
        };
        this.log.d("Sending response: ");
        this.log.d(msg);
        this.send_msg(msg, ws);
    }
    /*
    Send a message to a ws client
    */
    send_msg(msg, ws) {
        ws.send(JSON.stringify(msg));
    }
    reply_no_function(ws, call_identifier) {
        let msg = {
            data: {
                error: true,
                reason: "function_not_found",
            },
            type: "return_value",
            call_identifier,
        };
        this.send_msg(msg, ws);
        this.log.d(`Sent no function response to :${ws.hyperloop_id}`);
        this.log.d(msg);
    }
    send_call_request(ws, msg) {
        let { args, call_identifier, id } = msg;
        let _msg = { args, call_identifier, id, type: "call" };
        this.send_msg(_msg, ws);
    }
    acknowledge_register(ws) {
        let msg = {
            type: "registered"
        };
        this.send_msg(msg, ws);
        this.log.d("Ackldged register for client");
    }
    handle_close(ws) {
        this.log.d("Handling close");
    }
}
exports.Server = Server;
//# sourceMappingURL=hub.js.map