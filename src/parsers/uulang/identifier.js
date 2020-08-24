module.exports = (GT, { defineMatcher }) => {
  const {
    $MATCHES
  } = GT;

  const $IDENTIFIER = defineMatcher('Identifier', (ParentClass) => {
    return class IdentifierMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        this.setMatcher(
          $MATCHES(
            /[a-zA-Z_][a-zA-Z0-9_]+/,
            this.getMatcherOptions({
              debugSkip: 'all',
              finalize: ({ token }) => {
                return token.defineProperties({
                  name: token[0]
                });
              }
            })
          )
        );
      }
    };
  });

  return {
    $IDENTIFIER
  };
};
