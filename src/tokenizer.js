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

function isValidNum(num) {
  if (num === undefined || num === null)
    return false;

  if (!(num instanceof Number || typeof num !== 'number'))
    return false;
  
  return (!isNaN(num) && isFinite(num));
}

class Position {
  static create(_start, _end, _length) {
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

      var position = new Position(0);
      if (_position !== undefined) {
        if (_position instanceof Position) {
          position = _position.clone();
        } else if ((_position instanceof Number || typeof _position === 'number') && !isNaN(_position) && isFinite(_position)) {
          if (_position < 0 && length !== undefined)
            position = new Position(length + _position);
          else
            position = new Position(_position);
        }
      }

      return position;
    }
    
    var start = getPosition(_start, _length),
        end = getPosition(_end, _length);

    if (start === undefined && end === undefined)
      return new Position(0);
    else if (start === undefined)
      return end;
    else if (end === undefined)
      return start;

    return new Position(smallest(start.start, start.end, end.start, end.end), largest(start.start, start.end, end.start, end.end));
  }

  constructor(start, end) {
    this.start = start || 0;
    this.end = end;

    if (isValidNum(start) && isValidNum(end) && start > end) {
      this.start = end;
      this.end = start;
    }
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
  static create(type, source, position, value, rawValue, args) {
    var token = new Token(...(args || []));
    token.type = type;
    token.source = source;
    token.position = position;
    token.value = value;
    token.rawValue = (rawValue === undefined) ? value : rawValue;

    return token;
  }

  constructor(...args) {
    definePropertyRW(this, 'type', null);
    definePropertyRW(this, 'source', null);
    definePropertyRW(this, 'position', null);
    definePropertyRW(this, 'value', null);
    definePropertyRW(this, 'rawValue', null);
    definePropertyRW(this, 'args', args);
  }

  match() {}

  clone() {
    return Token.create(this.type, this.source, this.position, this.value, this.rawValue, this.args);
  }
};

function functionTokenFactory(name, func) {
  var Klass = class FuncToken extends Token {
    static create(source, position, value, rawValue, args) {
      var token = new Klass(...(args || []));
      token.source = source;
      token.position = position;
      token.value = value;
      token.rawValue = (rawValue === undefined) ? value : rawValue;

      return token;
    }

    constructor(...args) {
      super(...args);
      this.type = name;
    }

    match() {
      return func.call(this, ...(this.args || []));
    }

    clone() {
      return Klass.create(this.source, this.position, this.value, this.rawValue, this.args);
    }
  };

  return Klass;
}

function regularExpressionTokenFactory(name, _regexp, _matchIndex) {
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
    static create(source, position, value, rawValue, args) {
      var token = new Klass(...(args || []));
      token.source = source;
      token.position = position;
      token.value = value;
      token.rawValue = (rawValue === undefined) ? value : rawValue;

      return token;
    }

    constructor(...args) {
      super(...args);
      this.type = name;

      definePropertyRO(this, '_regexp', new RegExp(reSource, reFlags));
    }

    match() {
      var startPos = this.position.start;
      this.regexp.lastIndex = startPos;

      var str = this.source.toString(),
          match = this.regexp.exec(str);
      
      //console.log('Src: ', startPos, str, match, '[' + str.substring(startPos, startPos + 4) + ']');
      if (match && match.index === startPos)
        return Klass.create(this.source, new Position(startPos, startPos + match[0].length), (match[matchIndex] || match[0]), match[0], this.args);
    }

    clone() {
      return Klass.create(this.source, this.position, this.value, this.rawValue, this.args);
    }
  };

  return Klass;
}

class TokenStream {
  constructor(content) {
    definePropertyRW(this, '__stringCacheInvalid', true);
    definePropertyRW(this, '__stringCache', '');

    var tokens;

    if (content instanceof String || typeof content === 'string') {
      tokens = new Array(content.length);
      for (var i = 0, il = content.length; i < il; i++) {
        var c = content.charAt(i);
        tokens[i] = Token.create('CHAR', content, new Position(i, i + 1), c);
      }

      this._stringCacheInvalid = true;
    } else if (content instanceof TokenStream) {
      tokens = content.tokens.slice();
    } else if (content instanceof Array) {
      tokens = content.slice();
    } else {
      tokens = [];
    }

    definePropertyRW(this, 'position', new Position(0, 0));
    definePropertyRW(this, 'tokens', tokens);
  }

  toString() {
    if (this._stringCacheInvalid) {
      this._stringCacheInvalid = false;
      var stringCache = this._stringCache = (this.tokens.map((token) => token.rawValue)).join('');
      return stringCache;
    } else {
      return this._stringCache;
    }
  }

  length() {
    return this.tokens.length;
  }

  push(token) {
    this._stringCacheInvalid = true;
    this.tokens.push(token);
  }

  seek(_position) {
    this.position = Position.create(_position);
  }

  get(_position) {
    var position = Position.create(_position, undefined, this.length());
    console.log('Position: ', position, this.length());
    if (position.end === undefined)
      return this.tokens[position.start];
    
    return new TokenStream(this.tokens.slice(position.start, position.end));
  }

  consume(types) {
    for (var i = 0, il = types.length; i < il; i++) {
      var tokenType = types[i];
      
      tokenType.source = this;
      tokenType.position = this.position;

      console.log('Token Type: ', tokenType);
      var token = tokenType.match();
      if (token) {
        this.position = new Position(token.position.next());
        return token;
      }
    }
  }
};

class Tokenizer {
  constructor(_opts) {
    var opts = (_opts || {});

    Object.assign(this, opts);
  }

  parse(content, position) {
    var inStream = new TokenStream(content),
        outStream = new TokenStream();

    if (position !== undefined)
      inStream.seek(position);

    var token = inStream.consume(this.types);
    while(token) {
      outStream.push(token); 
      token = inStream.consume(this.types); 
    }

    return outStream;
  }
};

const WHITESPACE = regularExpressionTokenFactory('WHITESPACE', /(\s+)/),
      CHAR = functionTokenFactory('CHAR', function(matchChar) {
        var firstToken = this.source.get(this.position.start);
        if ((firstToken && matchChar === undefined) || (firstToken.type === 'CHAR' && firstToken.rawValue === matchChar))
          return firstToken;
      }),
      WORD = regularExpressionTokenFactory('WORD', /(\w+)/),
      FOLLOWING = functionTokenFactory('FOLLOWING', function(token) {
        var startPos = this.position.start,
            firstToken = this.source.get(startPos);

        if (firstToken && firstToken.type === token.type) {
          token.source = this.source;
          token.position = this.position;
          if (token.match()) {
            var secondToken = this.source.get(startPos + 1);
            return (secondToken) ? secondToken.clone() : undefined;
          }
        }
      }),
      REGEXP = function(regexp) {
        var Klass = regularExpressionTokenFactory('REGEXP', regexp);
        return new Klass();
      };

function stringMatcherFactory(tokenType, stringChar) {
  function matcher() {
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
  }

  var Klass = functionTokenFactory(tokenType, matcher);
  return Klass;
}

const TOKENS = {
  WHITESPACE,
  WORD,
  STRING_DQ: stringMatcherFactory('STRING_DQ', '"'),
  STRING_SQ: stringMatcherFactory('STRING_SQ', "'"),
  STRING_BT: stringMatcherFactory('STRING_BT', "`")
};

module.exports = Object.assign({
  Tokenizer,
  TOKENS
}, TOKENS);
