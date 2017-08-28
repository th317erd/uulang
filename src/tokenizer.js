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

    if (start instanceof Position) {
      if (!end)
        end = start.end;
      start = start.start;
    }

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
  constructor(type) {
    definePropertyRW(this, 'type', (type) ? type : '<undefined>');
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
    return (this.value || this.rawValue).toString();
  }
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
        tokens[i] = c;/*new Result({
          type: 'CHAR',
          source: this,
          position: new Position(i, i + 1),
          value: c,
          success: true
        });*/
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
      return this._tokens[this._position.start++];

    var position = new Position(_position, undefined, this.length());
    if (position.end === undefined)
      return this._tokens[position.start];
    
    return new TokenStream(this._tokens.slice(position.start, position.end));
  }

  eof() {
    return (this._position.start >= this._tokens.length);
  }

  close(set) {
    if (arguments.length > 0)
      this._eos = !!set;

    return this._eos;
  }
};

function createFunctionToken(name, func, resultFormatter) {
  return function(...args) {
    class FuncToken extends Token {
      constructor() {
        super(name);
      }
  
      match(stream) {
        var startPos = stream.position(),
            streamClone = new TokenStream(stream),
            ret = func.call(this, streamClone, ...(args || []));
        
        if (ret instanceof Result) {
          var endPos = (ret.position && (ret.position.end || ret.position.start));
          if (startPos !== endPos && ret.success)
            stream.seek(endPos);
        }
        
        return (ret && resultFormatter instanceof Function) ? resultFormatter(ret) : ret;
      }
    };

    return new FuncToken();
  };
}

function createREToken(name, _regexp, _matchIndex, resultFormatter) {
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

  return function(...args) {
    var RE = new RegExp(reSource, reFlags);
    class RegExpToken extends Token {
      constructor() {
        super(name);
  
        definePropertyRO(this, '_regexp', RE);
      }
  
      match(stream) {
        var startPos = stream.position();
        RE.lastIndex = startPos;
  
        var str = stream.toString(),
            match = RE.exec(str);
  
        //console.log('Src: ', startPos, str, match, '[' + str.substring(startPos, startPos + 4) + ']');
        if (match && match.index === startPos) {
          var endPos = startPos + match[0].length;
          stream.seekRaw(endPos);
  
          var result = new Result({
            type: name,
            source: stream,
            position: new Position(startPos, endPos),
            value: (matchIndex instanceof Function) ? matchIndex.call(this, ...match, startPos, stream) : (match[matchIndex] || match[0]),
            rawValue: match,
            success: true
          });

          return (resultFormatter instanceof Function) ? resultFormatter(result) : result;
        }
      }
    };

    return new RegExpToken();
  };
}

function createToken(name, helper, ...args) {
  if (helper instanceof RegExp || (helper instanceof String || typeof helper === 'string')) {
    return createREToken(name, helper, ...args);
  } else if (helper instanceof Function) {
    return createFunctionToken(name, helper, ...args);
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
        
        for (var i = 0, il = tokens.length; (i < il) && !stream.eof(); i++) {
          var token = tokens[i];
          if (!token || !(token instanceof Token))
            continue;

          var match = token.match(stream);
          if (!match || (match instanceof Result && !match.success)) {
            success = false;
            break;
          }

          finalResult = finalResult.concat(match);
        }

        return new Result({
          type: 'ALL',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: finalResult,
          rawValue: new TokenStream(finalResult),
          success: success
        });
      }, (result) => (result.success && result.value)),
      ANY = createFunctionToken('ANY', function(stream, ...args) {
        var startPos = stream.position(),
            tokens = [].concat(...args),
            finalResult = [];
        
        for (var i = 0, il = tokens.length; (i < il) && !stream.eof(); i++) {
          var token = tokens[i];
          if (!token || !(token instanceof Token))
            continue;

          var match = token.match(stream);
          if (!match || (match instanceof Result && !match.success))
            continue;

          finalResult = finalResult.concat(match);
        }

        return new Result({
          type: 'ANY',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: finalResult,
          rawValue: new TokenStream(finalResult),
          success: (finalResult.length > 0)
        });
      }, (result) => (result.success && result.value)),
      REPEAT = createFunctionToken('REPEAT', function(stream, token, min, max) {
        var startPos = stream.position(),
            finalResult = [],
            success = false;

        if (token && (token instanceof Token)) {
          success = true;

          while(!stream.eof()) {
            var match = token.match(stream);
            if (!match || (match instanceof Result && !match.success))
              break;

            finalResult = finalResult.concat(match);
          }
        }
        
        if (min && finalResult.length < min)
          success = false;

        if (max && finalResult.length > max)
          success = false;

        return new Result({
          type: 'REPEAT',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: finalResult,
          rawValue: new TokenStream(finalResult),
          success: success
        });
      }, (result) => (result.success && result.value)),
      NOT = createFunctionToken('NOT', function(stream, token) {
        var startPos = stream.position(),
            ret = (token && token instanceof Token) ? token.match(stream) : token;

        if (ret instanceof Result && !ret.success) {
          return new Result(Object.assign({}, ret, {
            type: ret.type,
            source: stream,
            position: new Position(ret.position),
            value: ret.value,
            rawValue: ret.value,
            success: true
          }));
        }
      }),
      FIRST = createFunctionToken('FIRST', function(stream, ...args) {
        var startPos = stream.position(),
            tokens = [].concat(...args),
            finalResult;
        
        for (var i = 0, il = tokens.length; (i < il) && !stream.eof(); i++) {
          var token = tokens[i];
          if (!token || !(token instanceof Token))
            continue;

          var match = token.match(stream);
          if (!match || (match instanceof Result && !match.success))
            continue;

          finalResult = match;
          break;
        }

        if (!finalResult)
          return;

        return new Result({
          type: finalResult.type,
          source: stream,
          position: new Position(startPos, stream.position()),
          value: finalResult.value,
          rawValue: finalResult.rawValue,
          success: finalResult.success
        });
      }),
      WHITESPACE = createREToken('WHITESPACE', /(\s+)/),
      CHAR = createFunctionToken('CHAR', function(stream, matchChar) {
        var startPos = stream.position(),
            firstToken = stream.get(),
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
          position: new Position(startPos, startPos + 1),
          value: firstToken.toString(),
          rawValue: firstToken,
          success: success
        });
      }),
      WORD = createREToken('WORD', /(\w+)/),
      REGEXP = function(regexp) {
        var Klass = createREToken('REGEXP', regexp);
        return new Klass();
      },
      FOLLOWING = createFunctionToken('FOLLOWING', function(stream, token) {
        var startPos = stream.position(),
            value = ALL(
              token,
              CHAR()
            ).match(stream);
        
        if (!value || (value instanceof Result && !value.success))
          return;

        return new Result({
          type: 'FOLLOWING',
          source: stream,
          position: new Position(startPos, stream.position()),
          value: value[1],
          rawValue: value,
          success: true
        });
      }, (result) => (result.success && result.value));

function stringMatcherFactory(tokenType, stringChar) {
  return createFunctionToken('STRING', function(stream) {
    var startPos = stream.position(),
        value = ALL(
          CHAR(stringChar),
          REPEAT(FIRST(FOLLOWING(CHAR('\\')), NOT(CHAR(stringChar)))),
          CHAR(stringChar)
        ).match(stream);

    if (!value || (value instanceof Result && !value.success))
      return;

    return new Result({
      type: 'STRING',
      source: stream,
      position: new Position(startPos, stream.position()),
      value: value.slice(1, -1).join(''),
      rawValue: value,
      success: !!value
    });
  });
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
