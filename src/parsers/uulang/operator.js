module.exports = (GT, { finalize, defineMatcher }) => {
  const {
    $MATCHES
  } = GT;

  const $OPERATOR = defineMatcher('$OPERATOR', (ParentClass) => {
    return class OperatorMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (
            $MATCHES(
              /(=|\+|-|\*|\/|==|===|<>|<<|>>|<=|>=|\+\+|--|\+=|-=|\*=|\/=|\||\|\|&|&&|\^)/,
              Object.assign({
                typeName: 'Operator',
                _finalize: finalize()
              }, opts)
            )
          )
        });
      }

      respond(context) {
        return this._matcher.exec(this.getParser(), this.getSourceRange(), context);
      }
    };
  });

  return {
    $OPERATOR
  };
};
