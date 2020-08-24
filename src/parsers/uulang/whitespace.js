module.exports = (GT, { defineMatcher }) => {
  const {
    $DISCARD,
    $OPTIONAL,
    $MATCHES
  } = GT;

  const $WS = defineMatcher('WhiteSpace', (ParentClass) => {
    return class WhiteSpaceMatcher extends ParentClass {
      constructor(_opts) {
        var opts      = _opts || {},
            min       = opts.min,
            max       = opts.max,
            minNumber = parseInt('' + min, 10),
            maxNumber = parseInt('' + max, 10);

        if (!isFinite(minNumber))
          minNumber = 1;

        if (!isFinite(maxNumber))
          maxNumber = 0;

        super(opts);

        var matcher = $MATCHES(new RegExp(`\\s{${minNumber},${(maxNumber) ? maxNumber : ''}}`), this.getMatcherOptions({ debugSkip: true }));

        if (opts.optional)
          matcher = $OPTIONAL(matcher);

        if (opts.discard)
          matcher = $DISCARD(matcher);

        this.setMatcher(matcher);
      }
    };
  });

  const $_WS = defineMatcher('OptionalWhiteSpace', (ParentClass) => {
    return class OptionalWhiteSpaceMatcher extends ParentClass {
      constructor(opts) {
        super(Object.assign({}, opts || {}, { optional: true, discard: true }));
      }
    };
  }, $WS);

  return {
    $WS,
    $_WS
  };
};
