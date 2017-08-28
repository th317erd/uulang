var T = require('./tokenizer');

var parseStr = "This is a simple test \"Oh hello yeah \\\"baby!\\\"\" some extra stuff",
    parsed = T.parse(parseStr,
      T.REPEAT(
        T.ANY(
          T.WHITESPACE(),
          T.STRING_DQ(),
          T.WORD()
        )
      )
    );

console.log('Tokens: ', parsed);
console.log('Input string: ', parseStr);
