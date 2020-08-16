module.exports = (GT, { finalize }) => {
  const {
    $PROGRAM,
    $OPTIONAL,
    $STRING_LITERAL,
    $NUMERIC_LITERAL
  } = GT;

  function $LITERAL(opts) {
    return $PROGRAM(
      $OPTIONAL($STRING_LITERAL()),
      $OPTIONAL($NUMERIC_LITERAL()),
      {
        _finalize: finalize(({ token }) => token.children[0])
      }
    );
  };

  return {
    $LITERAL
  };
};
