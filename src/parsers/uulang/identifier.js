module.exports = (GT) => {
  const {
    $MATCHES
  } = GT;

  function $IDENTIFIER(opts) {
    return $MATCHES(/[a-zA-Z][a-zA-Z0-9_]*/, Object.assign({ typeName: 'Identifier' }, opts));
  };

  return {
    $IDENTIFIER
  };
};
