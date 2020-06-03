


module.exports = { 
    get_logger : function(s) { 
	return function(msg) { 
	    console.log(`[${s}]:: ${msg}`)
	}
    } , 
    

}
