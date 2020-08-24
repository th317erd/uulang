module.exports = (GT, { defineMatcher }) => {
  const $RIGHT_HAND_EXPRESSION = defineMatcher('ExpressionStatement', (ParentClass) => {
    return class ExpressionMatcher extends ParentClass {
      constructor(_opts) {
        var opts = _opts || {};

        super(opts);

        const {
          $_WS,
          $SELECT,
          $LOOP,
          $EXPRESSION_STATEMENT,
          $FUNCTION_DECLARATOR
        } = GT;

        this.setMatcher(
          $LOOP(
            $SELECT(
              $_WS(),
              $EXPRESSION_STATEMENT(),
              $FUNCTION_DECLARATOR(),
              {
                debugSkip: true,
              }
            ),
            this.getMatcherOptions({
              debugSkip: true,
              before: ({ context, token }) => {
                context.parentScope = token;
                return token;
              },
              finalize: ({ token }) => {
                if (token.children.length > 1)
                  return token;

                return token.children[0];
              }
            })
          )
        );
      }
    };
  });

  return {
    $RIGHT_HAND_EXPRESSION
  };
};
