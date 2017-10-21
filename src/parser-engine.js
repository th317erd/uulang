import { noe } from './utils';
import Position from './position';
import Token, { NULL, STRING, NUMBER, BOOLEAN, ARRAY } from './token';
import TokenStream from './token-stream';

//const MUST_BE_TOKEN_MESSAGE = 'Resolver must return a token. If you want to return "nothing" consider returning the NULL token';

export function convertToTokenParser(_getter) {
  var getter = _getter;
  if (getter instanceof RegExp)
    getter = REGEXP(getter);
  else if (typeof getter === 'string' || getter instanceof String)
    getter = EQ(getter);
  else if (!(getter instanceof Function))
    throw new Error('Parser getter type not supported. Supported types are: RegExp, String, and Function');

  return getter;
}

export function coerceValueToToken(value, pos) {
  if (value instanceof Token)
    return value;

  if (noe(value))
    return NULL.call(this, pos);
  
  if (typeof value === 'string' || value instanceof String)
    return STRING.call(this, value.valueOf(), pos);

  if (typeof value === 'number' || value instanceof Number)
    return NUMBER.call(this, value.valueOf(), pos);

  if (typeof value === 'boolean' || value instanceof Boolean)
    return BOOLEAN.call(this, value.valueOf(), pos);

  if (value instanceof Array)
    return ARRAY.call(this, value, pos);
  
  if (value.toToken instanceof Function)
    return value.toToken(this, pos);

  throw new Error('Do not know how to convert value ' + value + ' to token');
}

export function createTokenParser(_getter, _resolver, _convertParams) {
  var resolver = _resolver,
      getter = convertToTokenParser(_getter);

  if (arguments.length < 2)
    resolver = (r) => r;
  
  return function(...args) {
    var params = (_convertParams instanceof Function) ? _convertParams.call(this, ...args) : args;

    return function() {
      var startPos = this.offset,
          context = new TokenStream(this),
          value = getter.call(context, ...params),
          handleFinalValue = (val) => {
            var ret = coerceValueToToken.call(this, val),
                pos = ret.position;

            if (ret.success) {
              //console.log('Seeking to: ', pos.start, pos.end);
              this.seek(pos.end);
            }
          
            return ret;
          };

      if (value instanceof Promise) {
        return (async (val) => {
          return handleFinalValue(await val);
        })(value);
      } else {
        value = resolver.call(this, value, ...params);
        if (value instanceof Promise)
          return value;
        
        return handleFinalValue(value);
      }
    };
  };
}

export function loop(cb) {
  async function loopAsync() {
    val = await val;
    if (val !== d)
      values.push(val);

    for (; !done; i++) {
      val = await cb.call(this, i, d, values);
      if (val !== d)
        values.push(val);
    }

    return doneValue;
  }

  var done = false,
      doneValue,
      d = function(_val) { done = true; doneValue = (arguments.length) ? _val : values; return d; },
      values = [],
      val;

  for (var i = 0; !done; i++) {
    val = cb.call(this, i, d, values);

    if (val instanceof Promise)
      return loopAsync.call(this);

    if (val !== d)
      values.push(val);
  }

  return doneValue;
}

/* --- DEFAULT TOKENS --- */

export const REGEXP = createTokenParser(function(regexp) {
  var startPos = this.offset;

  regexp.lastIndex = startPos;

  var str = this.toString(),
      match = regexp.exec(str);

  //console.log('Src: ', startPos, str, match, '[' + str.substring(startPos, startPos + 4) + ']');
  return (match && match.index === startPos) ? match : undefined;
}, function(_result, regexp, resolver) {
  var result = _result;
  if (resolver instanceof Function) {
    result = resolver.call(this, result);
  } else {
    if (result === undefined || result === null)
      return;

    result = result[0];
  }

  if (result instanceof Token)
    return result;

  if (result === undefined || result === null)
    return;
  
  return new Token({
    type: 'REGEXP',
    source: this,
    position: ('' + result).length,
    value: result,
    rawValue: _result,
    success: true
  });
}, function(_regexp, resolver) {
  function getFlags(flags) {
    var finalFlags = [];
    for (var i = 0, il = flags.length; i < il; i++) {
      var flag = flags.charAt(i);
      if (finalFlags.indexOf(flag) < 0)
        finalFlags.push(flag);
    }

    if (finalFlags.indexOf('g') < 0)
      finalFlags.push('g');

    return finalFlags;
  }

  var regexp = (_regexp instanceof String || typeof _regexp === 'string') ? new RegExp(_regexp, 'g') : _regexp,
      reSource = regexp.source,
      reFlags = getFlags(regexp.flags);

  return [new RegExp(reSource, reFlags), resolver];
});

export const EQ = createTokenParser(function(str) {
  return (this.substr(this.offset, str.length) === str);
}, function(_result) {
  var result = _result;
  if (resolver instanceof Function)
    result = resolver.call(this, result);

  if (result instanceof Token)
    return result;

  return new Token({
    type: 'EQ',
    source: this,
    position: ('' + result).length,
    value: result,
    rawValue: _result,
    success: true
  });
});

export const ALIAS = createTokenParser(function(parser, name) {
  return convertToTokenParser(parser).call(this);
}, function(token, parser, name) {
  if (!token)
    return;

  return new Token({
    ...token,
    type: name,
    source: token.source,
    position: token.position,
    value: token.value,
    success: token.success
  });
});
