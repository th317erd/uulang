module.exports = (GT, { finalize }) => {
  const {
    $MATCHES
  } = GT;

  function $OPERATOR(opts) {
    return $MATCHES(
      /(=|\+|-|\*|\/|==|===|<>|<<|>>|<=|>=|\+\+|--|\+=|-=|\*=|\/=|\||\|\|&|&&|\^)/,
      Object.assign({
        typeName: 'Operator',
        _finalize: finalize()
      }, opts)
    );
  };

  return {
    $OPERATOR
  };
};
