module.exports = (GT) => {
  const {
    $MATCHES
  } = GT;

  function $OPERATOR(opts) {
    return $MATCHES(/(=|\+|-|\*|\/|==|===|<>|<<|>>|<=|>=|\+\+|--|\+=|-=|\*=|\/=|\||\|\|&|&&|\^)/, Object.assign({ typeName: 'Operator' }, opts));
  };

  return {
    $OPERATOR
  };
};
