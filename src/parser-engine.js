import Token from './token';

export function createRegExpTokenParser(_regexp, resolver) {
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

  return createTokenParser(function() {
    debugger;
    console.log('Context: ', this);
    var RE = new RegExp(reSource, reFlags),
        startPos = this.position();

    RE.lastIndex = startPos;
  
    var str = this.toString(),
        match = RE.exec(str);

    //console.log('Src: ', startPos, str, match, '[' + str.substring(startPos, startPos + 4) + ']');
    return (match && match.index === startPos) ? match : undefined;
  }, function(_result) {
    var result = _result;
    if (resolver instanceof Function)
      result = resolver.call(this, result);
    else
      result = result[0];

    if (result === undefined)
      return;

    if (result instanceof Token)
      return result;
    
    return new Token({
      type: 'REGEXP',
      source: this,
      position: result.length,
      value: result,
      rawValue: _result,
      success: true
    });
  });
}

export function createMatchTokenParser(str, resolver) {
  return createTokenParser(function() {
    var startPos = this.position(),
        sourceStr = this.toString();
    
    return (sourceStr.substr(startPos, str.length) === str);
  }, function(_result) {
    var result = _result;
    if (resolver instanceof Function)
      result = resolver.call(this, result);

    if (result instanceof Token)
      return result;

    return new Token({
      type: 'MATCH',
      source: this,
      position: result.length,
      value: result,
      rawValue: _result,
      success: true
    });
  });
}

export function createTokenParser(_getter, resolver) {
  if (arguments.length < 2)
    throw new Error('Token parser must have at least two arguments (one getter, one resolver)');

  var getter = _getter;
  if (getter instanceof RegExp)
    getter = createRegExpTokenParser(getter);
  else if (typeof getter === 'string' || getter instanceof String)
    getter = createMatchTokenParser(getter);
  else if (!(getter instanceof Function))
    throw new Error('Parser getter type not supported. Supported types are: RegExp, String, and Function');
  
  return function(stream, ...params) {
    var value = getter.call(stream, stream, ...params);
    if (value instanceof Promise) {
      return new Promise((resolve, reject) => {
        value.then((result) => {
          var ret = resolver.call(stream, result, ...params);
          if (ret instanceof Promise) {
            ret.then(resolve, reject);
          } else {
            resolve(ret);
          }
        });
      });
    } else {
      return resolver.call(stream, value, ...params);
    }
  };
}
