module.exports = (GT, { finalize }) => {
  const {
    $GROUP
  } = GT;

  function $STRING_LITERAL(opts) {
    return $GROUP(
      '"',
      '"',
      '\\',
      Object.assign({
        typeName: 'StringLiteral',
        _finalize: finalize(({ token }) => {
          return token.defineProperties({
            value: token.body.value
          });
        })
      }, opts)
    );
  };

  return {
    $STRING_LITERAL
  };
};
