module.exports = (GT, { finalize }) => {
  const {
    $DISCARD,
    $EQUALS
  } = GT;

  function $END_OF_STATEMENT(opts) {
    return $DISCARD(
      $EQUALS(';')
    );
  };

  return {
    $END_OF_STATEMENT
  };
};
