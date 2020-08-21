module.exports = (GT, { finalize, defineMatcher }) => {
  const {
    $_WS,
    $DISCARD,
    $END_OF_STATEMENT,
    $OPTIONAL,
    $IDENTIFIER,
    $MATCHES,
    $LITERAL,
    $PROGRAM
  } = GT;

  const $VARIABLE_DECLARATOR = defineMatcher('$VARIABLE_DECLARATOR', (ParentClass) => {
    return class VariableDeclaratorMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (
            $PROGRAM(
              $IDENTIFIER({ typeName: 'VariableDeclaratorIdentifier'}),
              $DISCARD($_WS()),
              $MATCHES(/:/, { typeName: 'AssignmentOperator' }),
              $DISCARD($_WS()),
              $LITERAL({ typeName: 'VariableDeclaratorInitializer'}),
              $DISCARD($_WS()),
              $END_OF_STATEMENT(),
              {
                typeName: 'VariableDeclarator',
                _finalize: finalize(({ matcher, token }) => {
                  var parts = token.children.filter((token) => (token.typeName !== 'AssignmentOperator' && token.typeName !== 'WhiteSpace'));
                  if (parts.length !== 2)
                    return matcher.fail();

                  token.defineProperties({
                    id: parts[0],
                    init: parts[1],
                    children: parts
                  });

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
    $VARIABLE_DECLARATOR
  };
};
