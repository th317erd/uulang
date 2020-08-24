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
            $EQUALS('.', { typeName: 'AccessOperator' }),
            $IDENTIFIER(),
            this.getMatcherOptions({ debugSkip: true })
          )
        );
      }

      respond(context) {
        var result = super.respond(context);
        if (!this.isToken(result) || this.isSkipToken(result))
          return result;

        var token = result;

        var lastToken = context.parentScope && context.parentScope.getLastChild();
        if (lastToken && (lastToken.typeName === 'Identifier' || lastToken.typeName === 'MemberExpression')) {
          context.parentScope.setLastChild(
            this.createToken(token.getSourceRange(), {
              typeName: this.getTypeName(),
              object: lastToken,
              property: token.children[1]
            })
          );

          return this.skip(context, this.endOffset);
        } else {
          return this.error(context, "Syntax Error: Unexpected token '.'", this.startOffset + 1);
        }
      }
    };
  });

  return {
    $MEMBER_EXPRESSION
  };
};
