"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
class Entity {
    constructor({ entity_id }) {
        this.log = logger_1.make_logger(entity_id);
    }
    //for errors  
    catch_error(e) {
        this.log.i("Got error:\n" + e);
        //will decide if I want it to throw or not ? 
        //right now they will never throw 
        //probably need to throw at some point though 
        console.error(e.stack);
    }
    describe() {
        this.log.i("This is an entity :)");
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map