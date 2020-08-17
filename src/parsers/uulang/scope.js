module.exports = (GT, { finalize }) => {
  const {
    $_WS,
    $VARIABLE_DECLARATOR,
    $LOOP,
    $PROGRAM
  } = GT;

  function $SCOPE(opts) {
    return $LOOP(
      $PROGRAM(
        $_WS(),
        $VARIABLE_DECLARATOR(),
        $_WS(),
        {
          _finalize: finalize(({ token }) => {
            return token.children.find((child) => child.typeName !== 'WhiteSpace');
          })
        }
      ),
      {
        typeName: 'Program',
        _finalize: finalize()
      }
    );
  };

  return {
    $SCOPE
  };
};
