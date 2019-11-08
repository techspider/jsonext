/*
JSONext library. Copyright (C) techspider 2019.
Licensed under GNU GPLv3.

Minified version is available from http://github.com/techspider/jsonext/releases

JSON definitions retrieved from MDN doc:
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
*/

(function() {
    var _JSON = JSON;
    var _JSONext = {
        /**
         * Converts a JavaScript object or value to a JSON string.
         * @param {*} value The value to convert to a JSON string.
         * @param {Function} [replacer] A function that alters the behavior of the stringification process, or an array of `String` and `Number` objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string.
         * @param {String|Number} [space] A `String` or `Number` object that's used to insert white space into the output JSON string for readability purposes.
         */
        stringify: function(value, replacer, space) {
            return _JSON.stringify(value, replacer, space);
        },

        /**
         * Formats a JSONext string to standard JSON.
         * @param {String} text The string to process as JSONext.
         */
        process: function(text) {
            var procText = text;
            var litType = 0;
            var escape = false;

            // Process the JSON document. Check for single line comments, etc.
            for(var x = 0; x < procText.length; x++) {
                if(procText[x] == "\\") { // Check if character is escape character
                    if(escape) { // If \ character is being escaped, do not treat it as an escape character.
                        escape = false;
                        continue;
                    }
                    escape = true;
                    continue;
                } else if((procText[x] == '"') && (litType != 1)) { // Check if we are encountering a string literal.
                    litType = 1; // Switch interpreting mode.
                    continue;
                } else if((procText[x] == '"') && (litType == 1)) { // Check if we encounter a closing quote. It must not be an escape character.
                    if(escape) continue; // Ignore escape char
                    litType = 0;
                    continue;
                }
                if(escape) escape = false; // Turn off escape mode if it has been enabled.

                if((x + 1) < procText.length) {
                    if(litType != 0) continue; // Do not process literals.
                    if((procText[x] == '/') && (procText[x + 1] == '/')) { // Single line comment found, ignore
                        var nextNewLine = procText.indexOf('\n', x);
                        if(nextNewLine == -1) nextNewLine = (procText.length);
                        var t1 = procText.substring(0, x);
                        var t2 = procText.substring(nextNewLine, procText.length);
                        procText = t1 + t2;
                    } else if((procText[x] == '/') && (procText[x + 1] == '*')) {
                        var closingStrIndex = procText.indexOf('*/', x);
                        if(closingStrIndex == -1) throw new SyntaxError("Failed to parse JSONext, missing matching */ for multi line comment at char " + (x+1));
                        var t1 = procText.substring(0, x);
                        var t2 = procText.substring(closingStrIndex+2, procText.length);
                        procText = t1 + t2;
                        x = x - 1;
                    }
                }
            }
            return procText;
        },

        /**
         * Parses the specified JSONext string constructing the JavaScript value or object described by the string.
         * @param {String} text The string to parse as JSONext.
         * @param {Function} [reviver] If a function, this prescribes how the value originally produced by parsing is transformed, before being returned.
         * @returns The Object corresponding to the given JSON text.
         * @throws Throws a `SyntaxError` exception if the string to parse is not valid JSON.         
         */
        parse: function(text, reviver) {
            return _JSON.parse(this.process(text), reviver)
        },
        [Symbol.toStringTag]: "JSONext"
    };
    if(typeof window !== 'undefined')
        window.JSONext = _JSONext;
    else module.exports = _JSONext;
})();