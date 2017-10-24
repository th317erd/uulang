import { Token, createTokenParser, REPEAT, AND, OR, EQ } from 'adextopa';
import { IDENTIFIER, WS } from './misc';

export const DECLARATION = createTokenParser(function() {
  return AND(REPEAT(AND(WS, IDENTIFIER, WS, EQ(','))), WS, EQ('<'), IDENTIFIER, EQ('>'), WS, EQ(';')).call(this);
}, function(_result, resolver) {
  var result = (resolver instanceof Function) ? resolver.call(this, _result) : _result;

  console.log('DEC RESULT:', result);
  
  return new Token({
    ...result
  });
});
