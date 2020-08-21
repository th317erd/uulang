module.exports = (GT, { finalize, defineMatcher }) => {
  const $FUNCTION_BODY = defineMatcher('$FUNCTION_BODY', (ParentClass) => {
    return class FunctionBodyMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $END_OF_STATEMENT,
          $OPTIONAL,
          $EQUALS,
          $IDENTIFIER,
          $PROGRAM,
          $SCOPE
        } = GT;

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (
            $PROGRAM(
              $OPTIONAL($IDENTIFIER()),
              $_WS(),
              $EQUALS('->{', { typeName: 'FunctionScopeEntry' }),
              $SCOPE({ typeName: 'FunctionBody' }),
              $_WS(),
              $EQUALS('}', { typeName: 'FunctionScopeExit' }),
              $END_OF_STATEMENT(),
              {
                debug: true,
                typeName: 'FunctionDeclarator',
                _finalize: finalize(({ matcher, token }) => {
                  var scope = token.children.find((token) => (token.typeName === 'FunctionBody'));

                  if (token.children[0].typeName === 'Identifier')
                    token.defineProperties({ id: token.children[0] });

                  token.defineProperties({ children: [ scope ] });

                  return token;
                })
              }
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
    $FUNCTION_BODY
  };
};
