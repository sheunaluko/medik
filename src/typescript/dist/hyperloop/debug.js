"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hub_1 = require("./hub");
const client_1 = require("./client");
/*
    TODO

    create a test file in the dir .test.ts
    do the following
        - instantiate server and listen on port
        - instantiate one client which provides functionality
        - insatntiate second client which calls the functionality
            a couple of times and then returns

    [] Create wrapper of traceroute command then integrate it to hyperloop
    [] create js version


*/
let default_hub_port = 9011;
exports.main = {
    "1": function () {
        return __awaiter(this, void 0, void 0, function* () {
            //code on sista :p 
            let sops = {
                port: default_hub_port,
            };
            //create the hyerloop hub 
            let hl_server = new hub_1.Server(sops);
            //initiate it . 
            hl_server.initialize();
            /*
                C R E A T E | C L I E N T S
            */
            //now we create a producing client 
            let cops_1 = {
                host: "localhost",
                port: default_hub_port,
                id: 'producer_0'
            };
            // -
            let hlc_prod = new client_1.Client(cops_1);
            //and a consuming client 
            let cops_2 = {
                host: "localhost",
                port: default_hub_port,
                id: 'consumer_0'
            };
            // - 
            let hlc_cons = new client_1.Client(cops_2);
            /*
                I N I T I A L I Z E | P R O D U C E R | C L I E N T
            */
            // now the clients are initialized ... we will start with the producer. 
            // first we will connect the producer 
            let meh = yield hlc_prod.connect();
            console.log("Got assync connect: ", meh);
            // and then we will register a function 
            // first lets create it --- a simple adder  
            function adder(args) {
                return args.arg1 + args.arg2;
            }
            // and the create the registration ops
            let RegisterFunctionOps = {
                id: "sattsys.testing.producer_0.adder",
                handler: adder,
                args_info: [["arg1", "number"], ["arg2", "number"]]
            };
            //register the function
            hlc_prod.register_function(RegisterFunctionOps);
            /*
                I N I T I A L I Z E | C O N S U M E R | C L I E N T
            */
            /*
              First some discussion. At tthis point the server has been initialized, and both the proucing
              client and the consuming client have been initialized. In addition, the PRODUCING client .
              has registered a function with the hyperloop hub, and that function should be usable by
              any other clients.
    
              Note that the consuming client can request a list of available functions
            */
            //first we connect the hlc_cons ! lol had bad bug because of omitting this 
            yield hlc_cons.connect();
            let available = yield hlc_cons.get_available_functions();
            console.log("Retrieved available functions response:");
            console.log(available);
            /*
                ok so we print a list of available functions. But we already know that the producer
                made one so lets call it
            */
            console.log("Consumer requesting..");
            let result = yield hlc_cons.call({
                id: "sattsys.testing.producer_0.adder",
                args: { arg1: 10, arg2: 2 }
            });
            console.log("Got result: ");
            console.log(result);
            console.log("Done!");
            return result;
        });
    },
    "2": function () {
    },
};
//do it 
exports.main["1"]();
//# sourceMappingURL=debug.js.map