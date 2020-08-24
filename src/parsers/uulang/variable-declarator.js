module.exports = (GT, { defineMatcher }) => {
  const $VARIABLE_DECLARATOR = defineMatcher('VariableDeclarator', (ParentClass) => {
    return class VariableDeclaratorMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $EQUALS,
          $PROGRAM,
          $RIGHT_HAND_EXPRESSION
        } = GT;

        this.setMatcher(
          $PROGRAM(
            $EQUALS(':', { typeName: 'AssignmentOperator' }),
            $_WS(),
            $RIGHT_HAND_EXPRESSION(),
            this.getMatcherOptions({
              debugSkip: true,
              finalize: ({ context, matcher, token }) => {
                var lastToken = context.parentScope && context.parentScope.getLastChild();
                if (lastToken && lastToken.typeName === 'Identifier') {
                  token.defineProperties({
                    id: lastToken,
                    init: token.children[1]
                  });

                  context.parentScope.setLastChild(token);

                  return matcher.skip(context, matcher.endOffset);
                } else {
                  return matcher.error(context, "Syntax Error: Unexpected token ':'", matcher.startOffset + 1);
                }
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
