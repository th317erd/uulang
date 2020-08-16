module.exports = (GT, { finalize }) => {
  const {
    $_WS,
    $VARIABLE_DECLARATOR,
    $PROGRAM
  } = GT;

  function $SCOPE(opts) {
    return $PROGRAM(
      $_WS(),
      $VARIABLE_DECLARATOR(),
      $_WS(),
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
