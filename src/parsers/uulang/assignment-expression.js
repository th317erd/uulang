module.exports = (GT, { defineMatcher }) => {
  const $ASSIGNMENT_EXPRESSION = defineMatcher('AssignmentExpression', (ParentClass) => {
    return class FunctionBodyMatcher extends ParentClass {
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
            $EQUALS('=', { typeName: 'AssignmentOperator' }),
            $_WS(),
            $RIGHT_HAND_EXPRESSION(),
            this.getMatcherOptions({
              finalize: ({ matcher, token, context }) => {
                var lastToken = context.parentScope && context.parentScope.getLastChild();
                if (lastToken && (lastToken.typeName === 'Identifier' || lastToken.typeName === 'MemberExpression')) {
                  context.parentScope.setLastChild(
                    matcher.createToken(token.getSourceRange(), {
                      typeName: this.getTypeName(),
                      left: lastToken,
                      operator: token.children[0].value,
                      right: token.children[1]
                    })
                  );

                  return matcher.skip(context, matcher.endOffset);
                } else {
                  return matcher.error(context, "Syntax Error: Invalid assignment", matcher.startOffset + 1);
                }

                return ;
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
