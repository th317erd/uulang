module.exports = (GT, { getLastChild, setLastChild, defineMatcher }) => {
  const $ASSIGNMENT_EXPRESSION = defineMatcher('AssignmentExpression', (ParentClass) => {
    return class FunctionBodyMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $END_OF_STATEMENT,
          $EQUALS,
          $PROGRAM,
          $EXPRESSION
        } = GT;

        this.setMatcher(
          $PROGRAM(
            $EQUALS('=', { typeName: 'AssignmentOperator' }),
            $_WS(),
            $EXPRESSION(),
            $_WS(),
            $END_OF_STATEMENT(),
            this.getMatcherOptions({
              finalize: ({ matcher, token, context }) => {
                var lastToken = getLastChild(context.parentScope);
                if (lastToken && (lastToken.typeName === 'Identifier' || lastToken.typeName === 'MemberExpression')) {
                  setLastChild(context.parentScope,
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
