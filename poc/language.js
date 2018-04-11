"use strict";

var Core = (function () {
    var self = Object.create(null);

    self.read = function (stream) {
        var tokens = stream
            .replace(/\(|\)/g, " $& ")
            .split(/\s/)
            .filter(function (token) {
                return token != "";
            });

        if (tokens.length > 1 && tokens.indexOf("(") == -1) {
            throw "Syntax error: missing parens";
        }

        return tokens;
    };

    self.parse = function (tokens) {
        if (tokens.length == 0) {
            throw "Syntax error: unexpected end of input (missing closing parens)";
        }

        var token = tokens.shift();
        var list  = [];

        // New list of arguments
        if (token == "(") {
            // Append elements to list until ")"
            while (tokens[0] !== ")") {
                list.push(self.parse(tokens));
            }

            // Remove last ")"
            tokens.shift();

            return list;
        }
        // Parsing a value
        else {
            var tokenValue = Number(token);

            // Token is a valid number
            if (! Number.isNaN(tokenValue)) {
                return tokenValue;
            }

            // Token is everything else (mostly strings)
            return token;
        }
    };

    function evalList(expression, env) {
        var op     = expression[0];
        var args   = expression.slice(1);
        var method = undefined;

        // Compute operation sub-array
        if (Array.isArray(op)) {
            method = self.eval(op, env);
        }
        // Check if operation is available in environment
        else if (typeof op == "string") {
            method = env[op];
        }

        if (method == undefined) {
            // @TODO: better error handling (line/col - stacktrace)
            throw "Runtime error: undefined method `"+ op +"`";
        }

        args = args.map(function (a) {
            return Core.eval(a);
        });

        if (typeof method == "function") {
            return method.apply(null, args);
        }

        return expression;
    }

    self.eval = function (expression, env) {
        env = env ? env : self.env;

        // Handle lists
        if (Array.isArray(expression)) {
            return evalList(expression, env);
        }

        // Handle atoms
        if (env[expression] != undefined) {
            return env[expression];
        }

        // @TODO: handle strings "hello" or 'hello' so they're not variables

        // Return as-is if not found
        return expression;
    }

    // @TODO: put read/parse/eval in self.env.meta so it can be changed at runtime

    self.env = {
        "false": false,
        "true":  true,

        "=": function () {
            var args  = Array.prototype.slice.call(arguments, 0);
            var first = args[0];

            return args.reduce(function (r, a) {
                return r && args[0] == a;
            });
        },

        "+": function () {
            var args = Array.prototype.slice.call(arguments, 0);

            return args.reduce(function (r, a) {
                return r + a;
            });
        },

        "-": function () {
            var args = Array.prototype.slice.call(arguments, 0);

            return args.reduce(function (r, a) {
                return r - a;
            });
        },

        "*": function () {
            var args = Array.prototype.slice.call(arguments, 0);

            return args.reduce(function (r, a) {
                return r * a;
            });
        },

        "/": function () {
            var args = Array.prototype.slice.call(arguments, 0);

            return args.reduce(function (r, a) {
                return r / a;
            });
        },
    };

    return self;
})();

/*
['native', function () {
    return 1;
}]

['def', 'set', ['native', function (env) {
    env.key = val;
}]]
 */
