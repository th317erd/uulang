module.exports = (GT) => {
  const {
    $GROUP
  } = GT;

  function $STRING(opts) {
    return $GROUP('"', '"', '\\', Object.assign({ typeName: 'StringLiteral' }, opts));
  };

  return {
    $STRING
  };
};
