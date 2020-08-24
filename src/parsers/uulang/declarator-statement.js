module.exports = (GT, { defineMatcher }) => {
  const $DECLARATOR_STATEMENT = defineMatcher('DeclaratorStatement', (ParentClass) => {
    return class ExpressionMatcher extends ParentClass {
      constructor(_opts) {
        var opts = _opts || {};

        super(opts);

        const {
          $SELECT,
          $FUNCTION_DECLARATOR,
          $VARIABLE_DECLARATOR
        } = GT;

        this.setMatcher(
          $SELECT(
            $VARIABLE_DECLARATOR(),
            $FUNCTION_DECLARATOR(),
            this.getMatcherOptions()
          )
        );
      }
    };
  });

  return {
    $DECLARATOR_STATEMENT
  };
};
