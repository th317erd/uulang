var T = require('./tokenizer');

var parseStr = "This is a simple test \"Oh hello yeah \\\"baby!\\\"\" some extra stuff", parsed, parser = T.REPEAT(
  T.ANY(
    T.WHITESPACE(),
    T.STRING_DQ(),
    T.WORD()
  )
);

console.time('prof');
for (var i = 0; i < 1000; i++) {
  parsed = T.parse(parseStr, parser);
}
console.timeEnd('prof');
    
//console.log('Tokens: ', parsed);
//console.log('Input string: ', parseStr);
