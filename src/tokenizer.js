import { definePropertyRO, definePropertyRW, noe, isValidNum } from './utils';
import Position from './position';
import Token from './token';
import TokenStream from './token-stream';
import { isValidResult, convertToTokenParser, createTokenParser, isSuccessful, loop, REGEXP, EQ, ALIAS } from './parser-engine';

export const REPEAT = createTokenParser(function(_getter, _min, _max) {
  var getter = convertToTokenParser(_getter),
      min = (_min === undefined) ? 0 : _min,
      max = (_max === undefined) ? Infinity : _max;

  if (arguments.length === 2)
    max = min;

  return loop.call(this, (index, done, previousValue, values) => {
    if (index > 0 && !isValidResult(previousValue)) {
      if ((index - 1) >= min)
        return done(values.slice(0, -1));

      return done(null);
    }

    //console.log('LOOPING!!', index);
    if (index >= max)
      return done();

    return getter.call(this);
  });
}, function(result) {
  if (!isValidResult(result))
    return;

  return new Token({
    type: 'REPEAT',
    source: this,
    position: result[result.length - 1].position,
    value: result.map((t) => t.value).join(''),
    rawValue: result
  });
});

export const NOT = createTokenParser(function(_parser) {
  var parser = convertToTokenParser(_parser);
  return parser.call(this);
}, function(result) {
  if (!result || result.success === true)
    return;

  return new Token({
    type: 'NOT',
    source: result.source,
    position: result.position,
    value: result.value,
    rawValue: result.rawValue,
    success: true
  });
});

export const OR = createTokenParser(function(...parsers) {
  return loop.call(this, (index, done, previousValue) => {
    if (index > 0 && isValidResult(previousValue))
      return done(previousValue);

    if (index >= parsers.length)
      return done(null);

    return convertToTokenParser(parsers[index]).call(this);
  });
});

export const AND = createTokenParser(function(...parsers) {
  var results = [];

  for (var i = 0, il = parsers.length; i < il; i++) {
    var parser = convertToTokenParser(parsers[i]),
        value = parser.call(this);
    
    if (!isValidResult(value))
      return;

    results.push(value);
  }

  return results;
}, function(result) {
  if (!isValidResult(result))
    return;

  return new Token({
    type: 'AND',
    source: this,
    position: result[result.length - 1].position,
    value: result.map((t) => t.value).join(''),
    rawValue: result
  });
});

export const BODY = createTokenParser(function(boundaryChar, name) {
  if (!boundaryChar || boundaryChar.length !== 1)
    throw new Error('Boundary character must be exactly one character');

  if (this.eof())
    return;

  var startPos = this.offset,
      c = this.get();

  if (c !== boundaryChar)
    return;

  while (!this.eof()) {
    var c = this.get();
    if (c === '\\') {
      this.get();
      continue;
    }

    if (c === boundaryChar)
      break;
  }
  
  if (c !== boundaryChar)
    this.raise('Unexpected end of input');

  return this.get(new Position(startPos, this.offset)).toString();
}, function(result, c, name) {
  if (!isValidResult(result))
    return;

  return new Token({
    type: name || 'BODY',
    source: this,
    position: result.length,
    value: result.substring(1, result.length - 1),
    rawValue: result,
    success: true
  });
});

class Tokenizer {
  constructor(token, _opts) {
    var opts = _opts || {};

    this.token = token;
    this.options = opts;
  }

  parse(input, cb) {
    var src = new TokenStream(input),
        ret = this.token.call(src);
    
    if (ret instanceof Promise)
      ret.then((result) => cb.call(this, null, result), (err) => cb.call(err, null));
    else
      cb.call(this, null, ret);
  }
}

const TEST = createTokenParser(function() {
  var startPos = this.offset;
  return new Promise((resolve) => {
    setTimeout(() => {
      var pos = new Position(startPos, startPos + 5),
          str = this.get(pos).toString();

      resolve(new Token({
        type: 'TEST',
        source: this,
        position: pos,
        value: str
      }));
    }, 15);
  });
});

const MY_TOKEN = ALIAS(OR(/\w+/), 'MY_TOKEN');

//BODY('"', "STRING_DQ"), BODY("'", "STRING_SQ")

var tokenizer = new Tokenizer(REPEAT(OR(MY_TOKEN, TEST)));
tokenizer.parse('This stuff derp hello "this is a \\" DQ string" stuff and \'here we see a single quoted string', function(err, result) {
  console.log('FINAL RESULT: ', result);
});
