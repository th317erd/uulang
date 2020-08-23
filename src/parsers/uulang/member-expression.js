module.exports = (GT, { getLastChild, setLastChild, defineMatcher }) => {
  const $MEMBER_EXPRESSION = defineMatcher('MemberExpression', (ParentClass) => {
    return class FunctionBodyMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $DISCARD,
          $EQUALS,
          $IDENTIFIER,
          $PROGRAM
        } = GT;

        this.setMatcher(
          $PROGRAM(
            $DISCARD($EQUALS('.', { typeName: 'AccessOperator' })),
            $IDENTIFIER(),
            this.getMatcherOptions({
              finalize: ({ matcher, token, context }) => {
                var lastToken = getLastChild(context.parentScope);
                if (lastToken && (lastToken.typeName === 'Identifier' || lastToken.typeName === 'MemberExpression')) {
                  setLastChild(context.parentScope,
                    matcher.createToken(token.getSourceRange(), {
                      typeName: matcher.getTypeName(),
                      object: lastToken,
                      property: token.children[0],
                    })
                  );

                  return matcher.skip(context, matcher.endOffset);
                } else {
                  return matcher.error(context, "Syntax Error: Unexpected token '.'", matcher.startOffset + 1);
                }
              }
            })
          )
        );
      }
    };
  });

  return {
    $MEMBER_EXPRESSION
  };
};
