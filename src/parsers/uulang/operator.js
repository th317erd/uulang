module.exports = (GT, { defineMatcher }) => {
  const {
    $MATCHES
  } = GT;

  const $OPERATOR = defineMatcher('Operator', (ParentClass) => {
    return class OperatorMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        this.setMatcher(
          $MATCHES(
            /(=|\+|-|\*|\/|==|===|<>|<<|>>|<=|>=|\+\+|--|\+=|-=|\*=|\/=|\||\|\|&|&&|\^)/,
            this.getMatcherOptions()
          )
        );
      }
    };
  });

  return {
    $OPERATOR
  };
};
