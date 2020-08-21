module.exports = (GT, { defineMatcher }) => {
  const {
    $OPTIONAL,
    $MATCHES
  } = GT;

  const $WS = defineMatcher('$WS', (ParentClass) => {
    return class WhiteSpaceMatcher extends ParentClass {
      constructor(_opts) {
        var opts      = Object.assign({ typeName: 'WhiteSpace' }, _opts || {}),
            min       = opts.min,
            max       = opts.max,
            minNumber = parseInt('' + min, 10),
            maxNumber = parseInt('' + max, 10);

        if (!isFinite(minNumber))
          minNumber = 1;

        if (!isFinite(maxNumber))
          maxNumber = 0;

        super(opts);

        var matcher = $MATCHES(new RegExp(`\\s{${minNumber},${(maxNumber) ? maxNumber : ''}}`), opts);

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (opts.optional) ? $OPTIONAL(matcher) : matcher
        });
      }

      respond(context) {
        return this._matcher.exec(this.getParser(), this.getSourceRange(), context);
      }
    };
  });

  const $_WS = defineMatcher('$_WS', (ParentClass) => {
    return class OptionalWhiteSpaceMatcher extends ParentClass {
      constructor(opts) {
        super(Object.assign({}, opts || {}, { optional: true }));
      }
    };
  }, $WS);

  return {
    $WS,
    $_WS
  };
};
