module.exports = (GT, { finalize, defineMatcher }) => {
  const {
    $MATCHES
  } = GT;

  const $NUMERIC_LITERAL = defineMatcher('$NUMERIC_LITERAL', (ParentClass) => {
    return class NumericLiteralMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (
            $MATCHES(
              /[\d.-]+/,
              Object.assign({
                typeName: 'NumericLiteral',
                _finalize: finalize(({ token }) => {
                  return token.defineProperties({
                    value: token[0]
                  });
                })
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
    $NUMERIC_LITERAL
  };
};
