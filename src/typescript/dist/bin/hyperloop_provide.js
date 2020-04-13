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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const hub_1 = require("../hyperloop/hub");
const client_1 = require("../hyperloop/client");
const nutil = __importStar(require("../node_utils/index"));
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
        handler: function () {
            return __awaiter(this, void 0, void 0, function* () {
                let d = JSON.parse(nutil.run_cmd("get_covid_us_data").result.trim());
                return d;
            });
        },
        args_info: []
    },
    {
        id: "sattsys.hyperloop.traceroute",
        handler: function (args) {
            return __awaiter(this, void 0, void 0, function* () {
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
                let result_string = nutil.run_cmd(`traceroute -I ${args.url}`).result;
                args.log.d("Retrieved the result string: ");
                args.log.d(result_string);
                /*
                trace route row looks like this:
                '1  www.routerlogin.com (192.168.1.1)  3.348 ms  0.977 ms  1.516 ms'
                */
                let parse = function (row_string) {
                    let toks = row_string.split(/\s+/);
                    let [hop_number, domain, ip, t1, ms1, t2, ms2, t3, ms3] = toks;
                    let parsed = {
                        hop_number, domain,
                        ip: ip.replace("(", "").replace(")", ""),
                        t1, ms1, t2, ms2, t3, ms3
                    };
                    return parsed;
                };
                //then we are going to parse it 
                let data = result_string.trim().split("\n").map((x) => parse(x.trim()));
                args.log.d("Sending the resulting data: ");
                args.log.d(data);
                return data;
            });
        },
        args_info: [["url", "string"]]
    },
    {
        id: "sattsys.hyperloop.dnslookup",
        handler: (args) => __awaiter(void 0, void 0, void 0, function* () {
            /* by the way, nslookup output looks like this:
  
            Server:         192.168.1.1
            Address:        192.168.1.1#53
  
            Non-authoritative answer:
            www.cnn.com     canonical name = turner-tls.map.fastly.net.
            Name:   turner-tls.map.fastly.net
            Address: 151.101.53.67
  
          */
            let { domain, log } = args;
            log.d("Doing dns query");
            let result = yield nutil.run_cmd(`nslookup ${domain}`).result;
            var ip = null;
            try {
                ip = result.trim().split("\n").slice(-1)[0].split(" ")[1]; //lol 
                log.d("Successfully parsed ip");
            }
            catch (e) {
                log.d("error attempting to parse result:");
                log.d(result);
                log.d("Will return null ip");
            }
            return ip;
        }),
        args_info: [["ip", "string"]]
    },
    {
        id: "sattsys.hyperloop.geolocate_ip",
        handler: (args) => __awaiter(void 0, void 0, void 0, function* () {
            let { log, ip } = args;
            log.d("Geolocating ip: " + ip);
            let result = (yield nutil.run_cmd(`ip_info ${ip}`)).result;
            return JSON.parse(result);
        }),
        args_info: [["ip", "string"]]
    },
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
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        //create the hyerloop hub
        let hl_server = new hub_1.Server(sops);
        //initiate it .
        hl_server.initialize();
        let provider = new client_1.Client(cops);
        yield provider.connect();
        //register the functions 
        to_register.map((r) => provider.register_function(r));
    });
}
init();
//# sourceMappingURL=hyperloop_provide.js.map