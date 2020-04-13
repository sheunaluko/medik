"use strict";
/*
Typescript RAM module
for export to VCS

Sun Mar  1 16:49:45 PST 2020
*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../utils/index"));
const socksync = __importStar(require("../socksync/index"));
var log = util.get_logger("RAM");
/* PARAMS */
let subscribe_id = "main"; //see below (socksync) 
var initialized = false;
/* - - - */
exports.RAM = {
    RAM_module_load_time: new Date(),
};
function set(update) {
    /* util.update_in in will perform a nested update */
    util.update_in(exports.RAM, update.path, () => update.value);
    log.d(`Performed update on path ${update.path} , with value: ${update.value}`);
    /* need to broadcast the change using the socksync client */
    log.d("Broadcasting update via server");
    let obj_update = util.array_update_to_object_update(update);
    exports.RAM_SERVER.handle_update({ id: subscribe_id, data: obj_update });
}
exports.set = set;
function get(path) {
    /* util.get_in is helpful , will return null if dne */
    log.d(`Performing get on path ${path}`);
    return util.get_in(exports.RAM, path);
}
exports.get = get;
function on_update(obj) {
    /*
        Theoretically may not want to allow clients to
        update the RAM... but for now will implement it
    */
    log.d("Received update:");
    log.d(obj);
    //{ client only listens -> }
    //converts update in object form to array rep 
    //let update = util.object_update_to_array_update(obj) 
    //set(update)  
}
exports.on_update = on_update;
/**
 *INIT the RAM server for dispatching updates
 *
 * @export
 * @param {number} port
 */
function init_server(port) {
    log.i("Initializing RAM Server");
    exports.RAM_SERVER = new socksync.Server({ port });
    exports.RAM_SERVER.initialize();
}
exports.init_server = init_server;
function init_client(port) {
    log.i("Initializing RAM CLIENT");
    let ops = {
        port,
        host: "localhost",
        subscribe_id,
        on_update
    };
    exports.RAM_CLIENT = new socksync.Client(ops);
}
exports.init_client = init_client;
/**
 *Init the RAM Module
 *
 * @export
 * @param {number} server_port
 */
function init(server_port = 9005) {
    if (initialized) {
        return;
    }
    //init the server 
    init_server(server_port);
    /*
      init the local RAM Client
      IF you would like to have access to direct
      mirror of what other clients are seeing
    */
    //init the client  -> 
    //init_client(server_port) 
    log.i("Async init launch complete");
    initialized = true;
}
exports.init = init;
//# sourceMappingURL=index.js.map