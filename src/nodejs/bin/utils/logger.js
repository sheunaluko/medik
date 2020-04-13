"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    constructor(id) {
        this.enabled = true;
        this.id = id;
        this.header = `[${id}]::`;
    }
    l(...args) {
        //console.log(args)
        if (!this.enabled) {
            return;
        }
        var next_print;
        var to_flush = this.header;
        while (next_print = args.shift()) {
            next_print = next_print[0];
            //console.log(next_print) 
            if (next_print.constructor == String) {
                to_flush += (" " + next_print);
            }
            else {
                console.log(to_flush);
                console.log(JSON.stringify(next_print));
                to_flush = this.header;
            }
        }
        if (to_flush != this.header) {
            console.log(to_flush);
        }
    }
    i(...args) {
        this.l(args);
    }
    d(...args) {
        this.l(args);
    }
    disable() {
        this.enabled = false;
    }
    enable() {
        this.enabled = true;
    }
}
exports.Logger = Logger;
function make_logger(id) {
    return new Logger(id);
}
exports.make_logger = make_logger;
//# sourceMappingURL=logger.js.map