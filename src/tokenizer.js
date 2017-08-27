function defineProperty(writable, parent, name, value) {
  Object.defineProperty(parent, (name.charAt(0) === '_') ? name.substring(1) : name, {
    writable: writable,
    configurable: false,
    enumerable: (name.charAt(0) !== '_'),
    value: value
  });
}

const definePropertyRO = defineProperty.bind(this, false);
const definePropertyRW = defineProperty.bind(this, true);

function noe() {
  function isNOE(value) {
    if (value === null || value === undefined)
      return true;
  
    if ((typeof value === 'number' || value instanceof Number) && (isNaN(value) || !isFinite(value)))
      return true;
  
    if ((typeof value === 'string' || value instanceof String) && (value.length === 0 || value.trim().length === 0))
      return true;
  
    if (value instanceof Array && value.length === 0)
      return true;
  
    return !value;
  }

  for (var i = 0, il = arguments.length; i < il; i++) {
    var val = arguments[i];
    if (isNOE(val))
      return true;
  }

  return false;
}

function isValidNum(num) {
  if (num === undefined || num === null)
    return false;

  if (!(num instanceof Number || typeof num !== 'number'))
    return false;
  
  return (!isNaN(num) && isFinite(num));
}

class Position {
  constructor(_start, _end, _length) {
    function smallest() {
      for (var num, i = 0, il = arguments.length; i < il; i++) {
        var x = arguments[i];
        if (isValidNum(x) && (num === undefined || x < num))
          num = x;
      }

      return num;
    }

    function largest() {
      for (var num, i = 0, il = arguments.length; i < il; i++) {
        var x = arguments[i];
        if (isValidNum(x) && (num === undefined || x > num))
          num = x;
      }

      return num;
    }

    function getPosition(_position, length) {
      if (_position === undefined)
        return;

      var position = _position;
      if (_position !== undefined) {
        if (_position instanceof Position) {
          position = _position;
        } else if ((_position instanceof Number || typeof _position === 'number') && !isNaN(_position) && isFinite(_position)) {
          if (_position < 0 && length !== undefined)
            position = length + _position;
          else
            position = _position;
        }
      }

      return position;
    }
    
    var start = getPosition(_start, _length),
        end = getPosition(_end, _length);

    if (start instanceof Position)
      start = start.start;

    if (end instanceof Position)
      end = (noe(end.end)) ? end.start : end.end;

    this.start = start;
    this.end = end;
  }

  length() {
    return this.end - this.start;
  }

  next() {
    return this.end;
  }

  clone() {
    return new Position(this.start, this.end);
  }
};

class Token {
  constructor(...args) {
    definePropertyRW(this, 'type', '<undefined>');
    definePropertyRW(this, 'args', args);
  }

  match() {}
}

class Result {
  constructor(_opts) {
    var opts = _opts || {};
    if (noe(opts.type, opts.source, opts.position) || !opts.hasOwnProperty('value')) {
      console.error(opts);
      throw new Error('type, source, position, and value are required for Result');
    }

    definePropertyRO(this, 'type', opts.type);
    definePropertyRO(this, 'source', opts.source);
    definePropertyRO(this, 'position', opts.position);
    definePropertyRO(this, 'value', opts.value);
    definePropertyRO(this, 'success', !!opts.success);

    var keys = Object.keys(opts);
    for (var i = 0, il = keys.length; i < il; i++) {
      var key = keys[i];
      if (key === 'type' || key === 'source' || key === 'position' || key === 'value' || key === 'success')
        continue;

      this[key] = opts[key];
    }
  }

  toString() {
    return (this.value || this.rawValue);
  }
}

function createFunctionToken(name, func) {
  var Klass = class FuncToken extends Token {
    constructor(...args) {
      super(...args);
      this.type = name;
    }

    match(stream) {
      var streamClone = new TokenStream(stream),
          ret = func.call(this, streamClone, ...(this.args || []));
      
      if (ret instanceof Result) {
        if (ret.success)
          stream.seek(streamClone.getPosition());
        else
          return;
      }
      
      return ret;
    }
  };

  return function(...args) {
    return new Klass(...args);
  };
}

function createREToken(name, _regexp, _matchIndex) {
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
      reFlags = getFlags(regexp.flags),
      matchIndex = _matchIndex || 1;

  var Klass = class RegExpToken extends Token {
    constructor(...args) {
      super(...args);
      this.type = name;

      definePropertyRO(this, '_regexp', new RegExp(reSource, reFlags));
    }

    match(stream) {
      var startPos = stream.position();
      regexp.lastIndex = startPos;

      var str = stream.toString(),
          match = regexp.exec(str);

      console.log('RegExp match: ', str, startPos, match);
      
      //console.log('Src: ', startPos, str, match, '[' + str.substring(startPos, startPos + 4) + ']');
      if (match && match.index === startPos) {
        stream.seekRaw(match[0].length);

        return new Result({
          type: this.type,
          source: stream,
          position: new Position(startPos, startPos + match[0].length),
          value: (matchIndex instanceof Function) ? matchIndex.call(this, ...match, startPos, stream) : (match[matchIndex] || match[0]),
          rawValue: match,
          success: true
        });
      }
    }
  };

  return function(...args) {
    return new Klass(...args);
  };
}

class TokenStream {
  constructor(content) {
    definePropertyRW(this, '__stringCacheInvalid', true);
    definePropertyRW(this, '__stringCache', '');
    definePropertyRW(this, '__eos', false);

    var tokens,
        position;

    if (content instanceof String || typeof content === 'string') {
      tokens = new Array(content.length);
      for (var i = 0, il = content.length; i < il; i++) {
        var c = content.charAt(i);
        tokens[i] = new Result({
          type: 'CHAR',
          source: this,
          position: new Position(i, i + 1),
          value: c,
          success: true
        });
      }

      this._stringCache = content;
      this._stringCacheInvalid = false;
    } else if (content instanceof TokenStream) {
      tokens = content.tokens().slice();
      position = new Position(content.getPosition());
    } else if (content instanceof Array) {
      tokens = content.slice();
    } else {
      tokens = [];
    }

    definePropertyRW(this, '__position', (!position) ? new Position(0, 0) : position);
    definePropertyRW(this, '__tokens', tokens);
  }

  toString() {
    if (this._stringCacheInvalid) {
      this._stringCacheInvalid = false;
      var stringCache = this._stringCache = (this._tokens.map((result) => result.toString())).join('');
      return stringCache;
    } else {
      return this._stringCache;
    }
  }

  length() {
    return this._tokens.length;
  }

  push(token) {
    this._stringCacheInvalid = true;
    this._tokens.push(token);
  }

  seek(_position) {
    this._position = new Position(_position);
  }

  seekRaw(_position) {
    //TODO: In the future handle raw chars / vs tokens
    this.seek(_position);
  }

  tokens() {
    return (this._tokens || []);
  }

  position() {
    return this._position.start;
  }

  getPosition() {
    return this._position;
  }

  get(_position) {
    if (arguments.length === 0)
      return this._tokens[this._position.start];

    var position = new Position(_position, undefined, this.length());
    if (position.end === undefined)
      return this._tokens[position.start];
    
    return new TokenStream(this._tokens.slice(position.start, position.end));
  }

  close(set) {
    if (arguments.length > 0)
      this._eos = !!set;

    return this._eos;
  }
};

/*class Tokenizer {
  constructor(_opts) {
    var opts = (_opts || {});

    Object.assign(this, opts);
  }

  parse(content, position) {
    var inStream = new TokenStream(content),
        outStream = new TokenStream(),
        token;

    if (position !== undefined)
      inStream.seek(position);

    while((token = inStream.consume(outStream, this.types)))
      outStream.push(token);

    if (inStream.done())
      outStream.done(true);

    return outStream;
  }
};*/

function createToken(name, helper) {
  if (helper instanceof RegExp || (helper instanceof String || typeof helper === 'string')) {
    return createREToken(name, helper);
  } else if (helper instanceof Function) {
    return createFunctionToken(name, helper);
  } else if (helper instanceof Array) {
    return function() {
      return ALL(...helper);
    };
  }
}

const ALL = createFunctionToken('ALL', function(stream, ...args) {
        var startPos = stream.position(),
            tokens = [].concat(...args),
            finalResult = [],
            success = true;
        
        for (var i = 0, il = tokens.length; i < il; i++) {
          var token = tokens[i];
          if (!token || !(token instanceof Token))
            continue;

          var match = token.match.call(this, stream);
          if (!match || !(match instanceof Result)) {
            success = false;
            break;
          }

          finalResult.push(match);
        }

        return new Result({
          type: 'ALL',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: new TokenStream(finalResult),
          success: success
        });
      }),
      ANY = createFunctionToken('ANY', function(stream, ...args) {
        var startPos = stream.position(),
            tokens = [].concat(...args),
            finalResult = [];
        
        for (var i = 0, il = tokens.length; i < il; i++) {
          var token = tokens[i];
          if (!token || !(token instanceof Token))
            continue;

          var match = token.match.call(this, stream);
          console.log('Matching', token.type, match);
          if (match && (match instanceof Result))
            finalResult.push(match);
        }

        return new Result({
          type: 'ANY',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: new TokenStream(finalResult),
          success: (finalResult.length > 0)
        });
      }),
      REPEAT = createFunctionToken('REPEAT', function(stream, token, min, max) {
        var startPos = stream.position(),
            finalResult = [],
            success = true;

        if (token && (token instanceof Token)) {
          var match = token.match.call(this, stream);
          if (match && (match instanceof Result))
            finalResult.push(match);
          else
            success = false;
        }
        
        if (min && finalResult.length < min)
          success = false;

        if (max && finalResult.length > max)
          success = false;

        return new Result({
          type: 'REPEAT',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: new TokenStream(finalResult),
          success: success
        });
      }),
      NOT = createFunctionToken('NOT', function(stream, token) {
        var startPos = stream.position(),
            ret = (token && token instanceof Token) ? token.match.call(this, stream) : token;

        if (ret instanceof Result && !ret.success) {
          return new Result(Object.assign({}, ret, {
            type: ret.type,
            source: ret.stream,
            position: new Position(ret.position),
            value: ret.value,
            success: true
          }));
        }
      }),
      FIRST = createFunctionToken('FIRST', function(stream, token) {
        var startPos = stream.position(),
            tokens = [].concat(...args),
            finalResult;
        
        for (var i = 0, il = tokens.length; i < il; i++) {
          var token = tokens[i];
          if (!token || !(token instanceof Token))
            continue;

          var match = token.match.call(this, stream);
          if (match && (match instanceof Result)) {
            finalResult =match;
            break;
          }
        }

        return new Result({
          type: 'FIRST',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: finalResult,
          success: !!finalResult
        });
      }),
      WHITESPACE = createREToken('WHITESPACE', /(\s+)/),
      CHAR = createFunctionToken('CHAR', function(stream, matchChar) {
        var firstToken = stream.get(),
            success = true;
        
        if (matchChar) {
          var matchCharValue = (matchChar instanceof Result) ? matchChar.value : matchChar,
              firstTokenValue = (firstToken instanceof Result) ? firstToken.value : firstToken;

          if (firstTokenValue !== matchCharValue)
            success = false;
        }

        return new Result({
          type: 'CHAR',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: firstToken,
          success: success
        });
      }),
      WORD = createREToken('WORD', /(\w+)/),
      REGEXP = function(regexp) {
        var Klass = createREToken('REGEXP', regexp);
        return new Klass();
      },
      FOLLOWING = function() {
        return FIRST(
          NOT(CHAR('\\')),
          CHAR()
        );
      };

function stringMatcherFactory(tokenType, stringChar) {
  /*function matcher() {
    var firstToken = this.source.get(this.position.start);
    if (!firstToken || firstToken.type !== 'CHAR' || firstToken.rawValue !== stringChar)
      return;

    var stringTokenizer = new Tokenizer({
      types: [
        new FOLLOWING(new CHAR('\\')),
        new REGEXP(new RegExp('[^' + stringChar + ']'))
      ]
    });

    var outStream = stringTokenizer.parse(this.source, new Position(this.position.start + 1));
    if (!outStream.length())
      return;
    
    var sourcePosition = new Position(this.position.start, outStream.get(-1).position.end + 1),
        rawValue = this.source.get(sourcePosition).toString(),
        value = outStream.toString();
    
    return Klass.create(this.source, sourcePosition, value, rawValue);
  }*/

  //var Klass = createFunctionToken(tokenType, matcher);
  //return Klass;

  return function() {
    return ALL(
      CHAR(stringChar),
      REPEAT(FIRST(FOLLOWING(CHAR('\\')), NOT(CHAR(stringChar)))),
      CHAR(stringChar)
    );
  };
}

const TOKENS = {
  ALL,
  ANY,
  NOT,
  REPEAT,
  FIRST,
  WHITESPACE,
  CHAR,
  WORD,
  FOLLOWING,
  REGEXP,
  STRING_DQ: stringMatcherFactory('STRING_DQ', '"'),
  STRING_SQ: stringMatcherFactory('STRING_SQ', "'"),
  STRING_BT: stringMatcherFactory('STRING_BT', "`")
};

function parse(_stream, token) {
  if (!token || !(token instanceof Token))
    return;

  return token.match(new TokenStream(_stream));
}

module.exports = Object.assign({
  Position,
  Token,
  Result,
  TokenStream,
  createToken,
  parse,
  TOKENS
}, TOKENS);
