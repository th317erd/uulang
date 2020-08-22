module.exports = (GT, { defineMatcher }) => {
  const {
    $PROGRAM,
    $OPTIONAL,
    $STRING_LITERAL,
    $NUMERIC_LITERAL
  } = GT;

  const $LITERAL = defineMatcher('Literal', (ParentClass) => {
    return class LiteralMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        this.setMatcher(
          $PROGRAM(
            $OPTIONAL($STRING_LITERAL(), { typeName: 'LiteralStringOptional'}),
            $OPTIONAL($NUMERIC_LITERAL(), { typeName: 'LiteralNumericOptional'}),
            this.getMatcherOptions({
              finalize: ({ token }) => token.children[0]
            }, this.getOptions())
          )
        );
      }
    };
  });

  return {
    $LITERAL
  };
};
