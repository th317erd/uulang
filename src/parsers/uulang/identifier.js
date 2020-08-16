module.exports = (GT, { finalize }) => {
  const {
    $MATCHES
  } = GT;

  function $IDENTIFIER(opts) {
    return $MATCHES(
      /[a-zA-Z][a-zA-Z0-9_]*/, Object.assign({
      typeName: 'Identifier',
      _finalize: finalize(({ context, token }) => {
        return token.defineProperties({
          name: token[0]
        });
      })
    }, opts));
  };

  return {
    $IDENTIFIER
  };
};
