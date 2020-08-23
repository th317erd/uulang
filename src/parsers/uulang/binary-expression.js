module.exports = (GT, { defineMatcher }) => {
  const $BINARY_EXPRESSION = defineMatcher('BinaryExpression', (ParentClass) => {
    return class FunctionBodyMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $END_OF_STATEMENT,
          $EQUALS,
          $IDENTIFIER,
          $PROGRAM,
          $EXPRESSION
        } = GT;

        this.setMatcher(
          $PROGRAM(
            $IDENTIFIER(),
            $_WS(),
            $EQUALS('=', { typeName: 'AssignmentOperator' }),
            $_WS(),
            $EXPRESSION(),
            $_WS(),
            $END_OF_STATEMENT(),
            this.getMatcherOptions({
              finalize: ({ matcher, token }) => {
                return matcher.createToken(token.getSourceRange(), {
                  typeName: 'AssignmentExpression',
                  left: token.children[0],
                  operator: token.children[1].value,
                  right: token.children[2],
                });
              }
            })
          )
        );
      }
    };
  });

  return {
    $ASSIGNMENT_EXPRESSION
  };
};
