import { definePropertyRO, definePropertyRW } from './utils';
import Position from './position';

export const  ARRAY_TOKEN_STREAM = 1,
              STRING_TOKEN_STREAM = 2;

export default class TokenStream {
  constructor(content) {
    definePropertyRW(this, '__stringCacheInvalid', true);
    definePropertyRW(this, '__stringCache', '');
    definePropertyRW(this, '__eos', false);

    var tokens,
        position;

    if (typeof content === 'string' || content instanceof String) {
      tokens = content;

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

    definePropertyRW(this, '__tokensType', (tokens instanceof Array) ? ARRAY_TOKEN_STREAM : STRING_TOKEN_STREAM);
    definePropertyRW(this, '__position', (!position) ? new Position(0, 0) : position);
    definePropertyRW(this, '__tokens', tokens);
  }

  toString() {
    if (this._stringCacheInvalid) {
      this._stringCacheInvalid = false;

      var stringCache;
      if (this._tokensType === STRING_TOKEN_STREAM)
        stringCache = this._stringCache = this._tokens;
      else
        stringCache = this._stringCache = ((this._tokens || []).map((result) => result.toString())).join('');

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
    var position;

    if (arguments.length === 0) {
      if (this._tokensType === STRING_TOKEN_STREAM)
        return this._tokens.charAt(this._position.start++);
      return this._tokens[this._position.start++];
    } else {
      position = new Position(_position, undefined, this.length());
    }

    if (position.end === undefined) {
      position = position.start;

      if (this._tokensType === STRING_TOKEN_STREAM)
        return this._tokens.charAt(position);
      return this._tokens[position];
    }
    
    if (this._tokensType === STRING_TOKEN_STREAM)
      return new TokenStream(this._tokens.substring(position.start, position.end));

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
