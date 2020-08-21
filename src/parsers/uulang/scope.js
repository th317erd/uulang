module.exports = (GT, { finalize, get, defineMatcher }) => {
  const $SCOPE = defineMatcher('$SCOPE', (ParentClass) => {
    return class EndOfStatementMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $VARIABLE_DECLARATOR,
          $LOOP,
          $OPTIONAL,
          $PROGRAM,
          $FUNCTION_BODY
        } = GT;

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (
            $LOOP(
              $PROGRAM(
                $_WS(),
                $OPTIONAL($VARIABLE_DECLARATOR(), { typeName: 'ScopeVariableDeclaratorOptional'}),
                $_WS(),
                $OPTIONAL($FUNCTION_BODY(), { typeName: 'ScopeFunctionBodyOptional'}),
                $_WS(),
                {
                  _finalize: finalize(({ token }) => {
                    return token.children.find((child) => child.typeName !== 'WhiteSpace');
                  })
                }
              ),
              {
                debug: true,
                typeName: get(opts, 'typeName', 'Program'),
                _finalize: finalize()
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
    $SCOPE
  };
};
