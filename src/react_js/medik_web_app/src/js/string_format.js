
/* 
   
   FROM: https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format 
It's funny because Stack Overflow actually has their own formatting function for the String prototype called formatUnicorn. Try it! Go into the console and type something like:

"Hello, {name}, are you feeling {adjective}?".formatUnicorn({name:"Gabriel", adjective: "OK"});
Firebug

You get this output:

Hello, Gabriel, are you feeling OK?

You can use objects, arrays, and strings as arguments! I got its code and reworked it to produce a new version of String.prototype.format:
*/ 

String.prototype.format = String.prototype.format ||
function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};
