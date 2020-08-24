module.exports = (GT, { defineMatcher }) => {
  const $RIGHT_HAND_EXPRESSION = defineMatcher('RightHandExpressionStatement', (ParentClass) => {
    return class ExpressionMatcher extends ParentClass {
      constructor(_opts) {
        var opts = _opts || {};

        super(opts);

        const {
          $SELECT,
          $LOOP,
          $FUNCTION_DECLARATOR,
          $EXPRESSION_STATEMENT
        } = GT;

        this.setMatcher(
          $LOOP(
            $SELECT(
              $FUNCTION_DECLARATOR(),
              $EXPRESSION_STATEMENT(),
              { debugSkip: true }
            ),
            this.getMatcherOptions({
              debugSkip: true,
              before: ({ context, token }) => {
                context.parentScope = token;
                return token;
              }
            })
          )
        );
      }

      respond(context) {
        var result = super.respond(context);
        if (!this.isToken(result) || this.isSkipToken(result))
          return result;

        var token = result;
        if (token.children.length > 1)
          return token;

        return token.children[0];
      }
    };
  });

  return {
    $RIGHT_HAND_EXPRESSION
  };
};
