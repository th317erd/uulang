module.exports = (GT, { defineMatcher }) => {
  const $SCOPE = defineMatcher('Scope', (ParentClass) => {
    return class ScopeMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $EXPRESSION,
          $LOOP,
          $OPTIONAL,
          $PROGRAM
        } = GT;

        this.setMatcher(
          $LOOP(
            $PROGRAM(
              $_WS(),
              $OPTIONAL($EXPRESSION(), { typeName: 'ScopeExpressionOptional'}),
              $_WS(),
              {
                finalize: ({ token }) => {
                  return token.children[0];
                }
              }
            ),
            this.getMatcherOptions({ typeName: 'Scope' })
          )
        );
      }
    };
  });

  return {
    $SCOPE
  };
};
