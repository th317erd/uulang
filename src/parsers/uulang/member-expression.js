module.exports = (GT, { defineMatcher }) => {
  const $MEMBER_EXPRESSION = defineMatcher('MemberExpression', (ParentClass) => {
    return class FunctionBodyMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $EQUALS,
          $OPTIONAL,
          $IDENTIFIER,
          $PROGRAM
        } = GT;

        this.setMatcher(
          $PROGRAM(
            //$OPTIONAL($IDENTIFIER()),
            $EQUALS('.', { typeName: 'AccessOperator' }),
            $IDENTIFIER(),
            this.getMatcherOptions({
              finalize: ({ matcher, token, context }) => {
                // if (token.children[0].typeName === 'Identifier') {
                //   token.defineProperties({
                //     object: token.children[0],
                //     property: token.children[2]
                //   });

                //   return token;
                // }

                var lastToken = context.parentScope && context.parentScope.getLastChild();
                if (lastToken && (lastToken.typeName === 'Identifier' || lastToken.typeName === 'MemberExpression')) {
                  context.parentScope.setLastChild(
                    matcher.createToken(token.getSourceRange(), {
                      typeName: matcher.getTypeName(),
                      object: lastToken,
                      property: token.children[1],
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
