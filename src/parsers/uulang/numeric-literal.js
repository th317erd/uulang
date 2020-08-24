module.exports = (GT, { defineMatcher }) => {
  const {
    $MATCHES
  } = GT;

  const $NUMERIC_LITERAL = defineMatcher('NumericLiteral', (ParentClass) => {
    return class NumericLiteralMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        this.setMatcher(
          $MATCHES(
            /-?\d+(\.\d+)?([Ee]-?\d+)?/,
            this.getMatcherOptions({
              debugSkip: 'all',
              finalize: ({ token }) => {
                return token.defineProperties({
                  value: token[0]
                });
              }
            })
          )
        );
      }
    };
  });

  return {
    $NUMERIC_LITERAL
  };
};
