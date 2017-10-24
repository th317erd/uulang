import { Token, createTokenParser, REGEXP } from 'adextopa';

class KeywordToken extends Token {
  constructor(_opts) {
    var opts = {
      ...(_opts || {}),
      type: 'KEYWORD'
    };

    super(opts);
  }
}

export const KEYWORD = createTokenParser(function() {
  return REGEXP(/(var|if|continue|break)/g).call(this);
}, function(_result, resolver) {
  var result = (resolver instanceof Function) ? resolver.call(this, _result) : _result;

  console.log(result);
  
  return new KeywordToken({
    ...result
  });
});
