module.exports = (GT, { defineMatcher }) => {
  const {
    $_WS,
    $END_OF_STATEMENT,
    $IDENTIFIER,
    $MATCHES,
    $LITERAL,
    $PROGRAM
  } = GT;

  const $VARIABLE_DECLARATOR = defineMatcher('VariableDeclarator', (ParentClass) => {
    return class VariableDeclaratorMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        this.setMatcher(
          $PROGRAM(
            $IDENTIFIER({ typeName: 'VariableDeclaratorIdentifier'}),
            $_WS(),
            $MATCHES(/:/, { typeName: 'AssignmentOperator' }),
            $_WS(),
            $LITERAL({ typeName: 'VariableDeclaratorInitializer'}),
            $_WS(),
            $END_OF_STATEMENT(),
            this.getMatcherOptions({
              finalize: ({ matcher, token }) => {
                var parts = token.children.filter((token) => (token.typeName !== 'AssignmentOperator' && token.typeName !== 'WhiteSpace'));
                if (parts.length !== 2)
                  return matcher.fail();

                token.defineProperties({
                  id: parts[0],
                  init: parts[1],
                  children: parts
                });

                return token;
              }
            })
          )
        );
      }
    };
  });

  return {
    $VARIABLE_DECLARATOR
  };
};
