import { Token, createTokenParser, REGEXP, BLOCK } from 'adextopa';

export const STRING = BLOCK('"', 'STRING_DQ');

export const WS = createTokenParser(function() {
  return REGEXP(/\s*/g).call(this);
}, function(_result, resolver) {
  var result = (resolver instanceof Function) ? resolver.call(this, _result) : _result;

  console.log('WHITESPACE: ', result);
  
  return new Token({
    ...result,
    type: 'WHITESPACE',
    success: true
  });
});

export const IDENTIFIER = createTokenParser(function() {
  return REGEXP(/([a-zA-Z_][a-zA-Z_0-9]*)/g).call(this);
}, function(_result, resolver) {
  var result = (resolver instanceof Function) ? resolver.call(this, _result) : _result;

  console.log(result);
  
  return new Token({
    ...result,
    type: 'IDENTIFIER'
  });
});
