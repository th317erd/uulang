module.exports = (GT, { defineMatcher }) => {
  const $SCOPE = defineMatcher('Scope', (ParentClass) => {
    return class ScopeMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $IDENTIFIER,
          $SELECT,
          $LOOP,
          $END_OF_STATEMENT,
          $EXPRESSION_STATEMENT,
          $DECLARATOR_STATEMENT
        } = GT;

        this.setMatcher(
          $LOOP(
            $SELECT(
              $_WS(),
              $END_OF_STATEMENT(),
              $EXPRESSION_STATEMENT(),
              $DECLARATOR_STATEMENT(),
              { debugSkip: true }
            ),
            this.getMatcherOptions({
              debug: false,
              before: ({ context, token }) => {
                context.parentScope = token;
                return token;
              }
            })
          )
        );
      }
    };
  });

  return {
    $SCOPE
  };
};
