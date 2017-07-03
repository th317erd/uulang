var T = require('./tokenizer'),
    Tokenizer = T.Tokenizer;

var myTokenizer = new Tokenizer({
  types: [
    new T.WHITESPACE(),
    new T.WORD(),
    new T.STRING_DQ()
  ]
});

var parseStr = "This is a simple test \"Oh hello yeah \\\"baby!\\\"\" some extra stuff";
console.log('Tokens: ', myTokenizer.parse(parseStr).tokens);
console.log('Input string: ', parseStr);
