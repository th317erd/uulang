module.exports = (GT, { defineMatcher }) => {
  const {
    $GROUP
  } = GT;

  const $STRING_LITERAL = defineMatcher('StringLiteral', (ParentClass) => {
    return class StringLiteralMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        this.setMatcher(
          $GROUP(
            '"',
            '"',
            '\\',
            this.getMatcherOptions({
              debugSkip: 'all',
              finalize: ({ token }) => {
                return token.defineProperties({
                  value: token.body.value
                });
              }
            })
          )
        );
      }
    };
  });

  return {
    $STRING_LITERAL
  };
};
