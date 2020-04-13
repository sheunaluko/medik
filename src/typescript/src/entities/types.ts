//define CORE types as enum
export enum core { 
    string,
    array,
    dictionary,
    float,
    resource,
    operation,
    action,
    argument,
    result
}


export type type_handlers = {
    [id in core]: () => any  
} 

export type maybe_type_handlers = type_handlers | {} 


export function js_type(x : any) {

    switch (x.constructor) {

    case String :
	return core.string
	break

    case Array :
	return core.array
	break

    case Object :
	return core.dictionary
	break

    case Number :
	return core.float 
	break

    }

    return null
}

