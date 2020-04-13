"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const RAM = __importStar(require("../ram/index"));
//init the ram 
RAM.init();
//params 
const rate = 2000;
//and create a loop to update the RAM server 
var counter = 0;
//
setInterval(function () {
    //let p = "path_" + counter    
    RAM.set({
        path: ["counter"],
        value: counter++,
    });
}, rate);
//# sourceMappingURL=ram_sim.js.map