module.exports = (GT, { finalize }) => {
  const {
    $MATCHES
  } = GT;

  function $NUMERIC_LITERAL(opts) {
    return $MATCHES(
      /[\d.-]+/,
      Object.assign({
        typeName: 'NumericLiteral',
        _finalize: finalize(({ token }) => {
          return token.defineProperties({
            value: token[0]
          });
        })
      }, opts)
    );
  };

  return {
    $NUMERIC_LITERAL
  };
};
