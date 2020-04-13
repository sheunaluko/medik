import * as types from "../types";
import { Operation } from "./operation";
import * as res from "../resources/resource" 

type arr_fn<T> =  (arg: Array<T>) => any; 


interface ArrayOpArg<T> { 
	fn :  arr_fn<T> , 
	id?  : string  , 
}  

interface ResourceArgs { 
	resources : res.Resource[] , 
	resource : res.Resource , 
} 

export class ArrayOperation<T> extends Operation {

  fn: arr_fn<T>

  constructor({ fn, id = "array_operation" } : ArrayOpArg<T>) {
    let entity_id = id;
    if (!fn) {
      throw "Please provide fn";
    }
    super({ entity_id });

    this.fn = fn;
  }

  async run({ resources, resource } : ResourceArgs) { 
    //this operation is performed on some resource
    //it will default to retrieving the resource as an array

    //defaults to only acept 1 arg
    if (!resource) {
      resource = resources[0];
    }

    try {
      let type = types.core.array;
      let result = await resource.as({ type});
      let value = this.fn(result);

      this.log.d(`Got value: ${value}`);
      return value;
    } catch (e) {
      this.catch_error(e);
    }
  }
}
