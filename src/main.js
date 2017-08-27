var T = require('./tokenizer');

// var T = require('./tokenizer'),
//     Tokenizer = T.Tokenizer;

// var myTokenizer = new Tokenizer({
//   types: [
//     new T.WHITESPACE(),
//     new T.WORD(),
//     new T.STRING_DQ()
//   ]
// });

// parse([T.WHITESPACE(), T.WORD(), T.STRING_DQ()], function() {

// })

var parseStr = "This is a simple test \"Oh hello yeah \\\"baby!\\\"\" some extra stuff",
    parsed = T.parse(parseStr,
      T.REPEAT(
        T.ANY(
          T.WHITESPACE(),
          T.WORD(),
          T.STRING_DQ()
        )
      )
    );

console.log('Tokens: ', parsed.value.tokens());

console.log('Input string: ', parseStr);
