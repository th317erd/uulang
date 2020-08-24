module.exports = (GT, { defineMatcher }) => {
  const {
    $SELECT,
    $STRING_LITERAL,
    $NUMERIC_LITERAL
  } = GT;

  const $LITERAL = defineMatcher('Literal', (ParentClass) => {
    return class LiteralMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        this.setMatcher(
          $SELECT(
            $STRING_LITERAL(),
            $NUMERIC_LITERAL(),
            this.getMatcherOptions()
          )
        );
      }
    };
  });

  return {
    $LITERAL
  };
};
