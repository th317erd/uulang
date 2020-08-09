module.exports = (GT) => {
  const {
    $OPTIONAL,
    $MATCHES
  } = GT;

  function $WS(_opts) {
    var opts      = _opts || {},
        min       = opts.min,
        max       = opts.max,
        minNumber = parseInt('' + min, 10),
        maxNumber = parseInt('' + max, 10);

    if (!isFinite(minNumber))
      minNumber = 1;

    if (!isFinite(maxNumber))
      maxNumber = 1;

    var matcher = $MATCHES(new RegExp(`\\s{${minNumber},${(maxNumber) ? maxNumber : ''}}`), opts);
    return (opts.optional) ? $OPTIONAL(matcher) : matcher;
  };

  function $_WS(opts) {
    return $WS(Object.assign({ typeName: 'WhiteSpace' }, opts || {}, { optional: true }));
  }

  return {
    $WS,
    $_WS
  };
};
