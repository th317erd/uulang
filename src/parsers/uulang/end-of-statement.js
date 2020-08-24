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
            $EQUALS(';', 'EndOfStatementMatcher'),
            this.getMatcherOptions({ debugSkip: 'all' })
          )
        );
      }
    };
  });

  return {
    $END_OF_STATEMENT
  };
};
