
export class Logger { 
    
    id : string  
    header : string 
    enabled : boolean  
    constructor(id : string) { 
	this.enabled = true 
    this.id = id 
    this.header = `[${id}]::` 
    }

    l(...args : any []) { 

        //console.log(args)
        if (!this.enabled) { return } 

        var next_print : any  
        var to_flush = this.header
        while (next_print = args.shift() ) {  

            next_print = next_print[0]
            
            //console.log(next_print) 
            
            if (next_print.constructor == String) { 
                to_flush += (" "  + next_print) 
            } else { 
                console.log(to_flush) 
                console.log(JSON.stringify(next_print)) 
                to_flush = this.header 
            } 

        } 

        if (to_flush != this.header)  {
            console.log(to_flush) 
        }

    }
    
    i(...args : any[]) { 
        this.l(args)
    }

    d(...args : any[]) { 
        this.l(args) 
    }

    disable() {
        this.enabled = false 
    }

    enable() { 
        this.enabled = true 
    }
    
}


export function make_logger(id :string) { 
    return new Logger(id) 
}
