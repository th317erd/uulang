import { noe, isValidNum } from './utils';

export default class Position {
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

  equal(pos) {
    return (pos && pos.start === this.start && pos.end === this.end);
  }

  range(pos) {
    var min = this.start,
        max = this.end || this.start;
    
    if (pos === undefined || pos === null)
      return max - min;

    if ((typeof pos === 'number' || pos instanceof Number)) {
      if (pos < min)
        min = pos;

      if (pos > max)
        max = pos;
    } else {
      if (pos.start < min)
        min = pos.start;

      if (pos.start > max)
        max = pos.start;

      if (pos.end && pos.end > max)
        max = pos.end;
    }
      
    return max - min;
  }
};
