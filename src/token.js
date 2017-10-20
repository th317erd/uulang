import { definePropertyRO, definePropertyRW, noe } from './utils';
import Position from './position';

export default class Token {
  constructor(_opts) {
    var opts = _opts || {},
        type = opts.type || this.constructor.name,
        source = opts.source,
        position = opts.position;

    if (noe(type, source, position))
      throw new Error('"type", "source", and "position" are required attributes when rejecting a token');

    definePropertyRW(this, 'type', type);
    definePropertyRW(this, 'source', source);
    definePropertyRW(this, 'position', position);
    definePropertyRW(this, 'value', opts.value);
    definePropertyRW(this, 'success', !!opts.success);

    var keys = Object.keys(opts);
    for (var i = 0, il = keys.length; i < il; i++) {
      var key = keys[i];
      if (key === 'type' || key === 'source' || key === 'value' || key === 'success')
        continue;

      this[key] = opts[key];
    }
  }

  toString() {
    return (this.value || this.rawValue).toString();
  }
}
