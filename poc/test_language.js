QUnit.module("Core");

QUnit.test("Lex", function (assert) {
    var read = Core.read;

    assert.deepEqual(read("false"), ["false"], "booleans");

    assert.deepEqual(read("500"), ["500"], "numbers");

    assert.deepEqual(
        read("(+ 1 2)"),
        ["(", "+", "1", "2", ")"],
        "list",
    );

    assert.deepEqual(
        read("(\tfoo \n(bar   1    2)  3)"),
        ["(", "foo", "(", "bar", "1", "2", ")", "3", ")"],
        "complex list with odd whitespace",
    );

    assert.throws(function () {
        read("+ 1 2");
    }, /syntax error/i,
    "throws when there are no parens");
});

QUnit.test("Parse", function (assert) {
    var parse = function (str) {
        return Core.parse(Core.read(str));
    };

    assert.equal(parse("false"), "false", "boolean false");
    assert.equal(parse("true"),  "true",  "boolean true");

    assert.equal(parse("42"), 42, "numbers");

    assert.equal(parse("identifier"), "identifier", "identifiers");

    assert.deepEqual(
        parse("(+ 1 2)"),
        ["+", 1, 2],
        "a list of elements"
    );

    assert.deepEqual(
        parse("(+ 1 (* (+ 2 3) 4))"),
        ["+", 1, ["*", ["+", 2, 3], 4]],
        "a nested list"
    );

    assert.throws(function () {
        parse("(+ 1 2");
    }, /syntax error/i,
    "throws when parens aren't matched");
});

QUnit.test("Eval - atomic values", function (assert) {
    var eval = Core.eval;

    assert.equal(eval("false"), false, "boolean false");
    assert.equal(eval("true"),  true,  "boolean true");

    /*
    // @TODO: throws if unterminated quote
    assert.equal(eval("\"Hello World!\""), "Hello World!",  "\"strings\"");
    assert.equal(eval("'Hello World!'"), "Hello World!",  "'strings'");
    */

    assert.equal(eval(42), 42, "numbers");

    assert.throws(function () {
        eval(["unknown-action", "arg1", "arg2"]);
    }, /runtime error/i,
    "throws when an unknown method is used");
});

QUnit.test("Eval - Simple arithmetic", function (assert) {
    var eval = Core.eval;

    assert.equal(eval(["+", 1, 1]), 2, "addition");

    assert.equal(eval(["-", 1, 1]), 0, "substraction");

    assert.equal(eval(["*", 2, 2]), 4, "multiplication");

    assert.equal(eval(["/", 6, 2]), 3,   "division");
    assert.equal(eval(["/", 6, 4]), 6/4, "division");

    assert.equal(
        eval(["+", 1, ["*", ["/", 6, 4], 5, 1.2], 3]),
        1 + ((6 / 4) * 5 * 1.2) + 3,
        "full arithmetic"
    );
});

QUnit.test("Eval - Equality", function (assert) {
    var eval = Core.eval;

    assert.equal(eval(["=", 1, 1]), true,  "simple equality : true");
    assert.equal(eval(["=", 1, 2]), false, "simple equality : false");
    assert.equal(eval(["=", 1, 1, 1, 1]), true, "chained equality");

    assert.equal(eval(["=", ["+", 1, 1], ["-", 5, 3]]), true, "nested list in equality");

    // @TODO: deep equality like objects/arrays/functions
    // @TODO: 1 != true, 0 != false
});
