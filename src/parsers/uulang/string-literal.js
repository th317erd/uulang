module.exports = (GT, { finalize, defineMatcher }) => {
  const {
    $GROUP
  } = GT;

  const $STRING_LITERAL = defineMatcher('$STRING_LITERAL', (ParentClass) => {
    return class StringLiteralMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (
            $GROUP(
              '"',
              '"',
              '\\',
              Object.assign({
                typeName: 'StringLiteral',
                _finalize: finalize(({ token }) => {
                  return token.defineProperties({
                    value: token.body.value
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
    $STRING_LITERAL
  };
};
