module.exports = (GT, { finalize, defineMatcher }) => {
  const {
    $MATCHES
  } = GT;

  const $IDENTIFIER = defineMatcher('$IDENTIFIER', (ParentClass) => {
    return class IdentifierMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (
            $MATCHES(
              /[a-zA-Z][a-zA-Z0-9_]+/,
              Object.assign({
                typeName: 'Identifier',
                _finalize: finalize(({ context, token }) => {
                  return token.defineProperties({
                    name: token[0]
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
    $IDENTIFIER
  };
};
