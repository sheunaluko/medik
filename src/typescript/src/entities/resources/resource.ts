import * as entity from "../entity";
import * as types from "../types";
import {type_handlers, maybe_type_handlers} from "../types" ; 

export interface ResourceOp {
  entity_id: string;
  type_handlers? : type_handlers 
}

export interface ResourceArgs { 
	resource : Resource  , 
	resources:  Resource[]   
}

export function isResourceOp(object: any): object is ResourceOp {
    return 'entity_id' in object; 
}

export class Resource extends entity.Entity {
  type_handlers: types.maybe_type_handlers;
  default_type : types.core   

  constructor(ops: ResourceOp) {
	super(ops);  
	
	if (!ops.type_handlers) { 
		this.type_handlers = {} 
	}
  }

  set_type_handler( type : types.core , handler : () => any ) { 
	  (this.type_handlers as type_handlers)[type] = handler 
  }

  async as({type} : {type : types.core})  {
    this.log.d("Request to resolve resource to type: " + type);

    let fn = (this.type_handlers as type_handlers)[type];

    this.log.d("Available type handler keys! ");
    this.log.d(Object.keys(this.type_handlers));

    if (fn) {
      try {
        var result = await fn.bind(this)();
        //here we should actually coerce the type
        //in case the provided function failed
        switch (type) {
          case types.core.string:
            this.log.d("Want string");
            if (!(result.constructor == String)) {
              this.log.d("Coercing to string");
              result = String(result);
            }

            break;
          case types.core.float:
            this.log.d("Want float");
            if (!(result.constructor == Number)) {
              this.log.d("Coercing to float");
              result = Number(result);
            }
            break;

          case types.core.array:
            this.log.d("Want array");
            if (!(result.constructor == Array)) {
              this.log.d("Coercing to Array");
              result = [result];
            }
            break;

          default:
            this.log.d("Want unknown");
            this.log.d("Not performing any type conversions");
            break;
        }

        //this.log.d("Got result as: ")
        this.log.d("Suppressing result (entities > resource.js)");
        //this.log.d(result)
        this.log.d(`Type of result = ${types.js_type(result)}`);
        return result;
      } catch (e) {
        this.catch_error(e);
        throw e;
      }
    } else {
      throw "Unavailable type!";
    }
  }
}
