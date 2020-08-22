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
            /[a-zA-Z][a-zA-Z0-9_]+/,
            this.getMatcherOptions({
              finalize: ({ context, token }) => {
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
