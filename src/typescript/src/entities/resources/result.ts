import * as res from "./resource";
import * as types from "../types";

/* wrapper for result after a computation has been performed */

export class Result extends res.Resource {
  value: any;

  constructor(ops: { value: any; entity_id?: string }) {
    if (res.isResourceOp(ops)) {
      super(ops);
    } else {
      var entity_id = "result_resource";
      super(Object.assign(ops, { entity_id }));
    }
    if (!ops.entity_id) {
      ops.entity_id = entity_id;
    }

    this.value = ops.value;

    //now we determine what the type of the value is, and we set the type handler
    let tp = types.js_type(ops.value);
    this.set_type_handler(tp, function() {
      return ops.value;
    });
  }
}
