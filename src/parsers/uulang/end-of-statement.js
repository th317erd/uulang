module.exports = (GT, { defineMatcher }) => {
  const {
    $DISCARD,
    $EQUALS
  } = GT;

  const $END_OF_STATEMENT = defineMatcher('EndOfStatement', (ParentClass) => {
    return class EndOfStatementMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        this.setMatcher(
          $DISCARD(
            $EQUALS(';', { typeName: 'EndOfStatementMatcher'}),
            this.getMatcherOptions()
          )
        );
      }
    };
  });

  return {
    $END_OF_STATEMENT
  };
};
