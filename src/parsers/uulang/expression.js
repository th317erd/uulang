module.exports = (GT, { defineMatcher }) => {
  const $EXPRESSION = defineMatcher('Expression', (ParentClass) => {
    return class ExpressionMatcher extends ParentClass {
      constructor(_opts) {
        var opts = _opts || {};

        super(opts);

        const {
          $IDENTIFIER,
          $ASSIGNMENT_EXPRESSION,
          $VARIABLE_DECLARATOR,
          $OPTIONAL,
          $PROGRAM,
          $FUNCTION_DECLARATOR
        } = GT;

        this.setMatcher(
          $PROGRAM(
            $OPTIONAL($ASSIGNMENT_EXPRESSION(), { typeName: 'ExpressionAssignmentExpressionOptional'}),
            $OPTIONAL($VARIABLE_DECLARATOR(), { typeName: 'ExpressionVariableDeclaratorOptional'}),
            $OPTIONAL($FUNCTION_DECLARATOR(), { typeName: 'ExpressionFunctionBodyOptional'}),
            $OPTIONAL($IDENTIFIER(), { typeName: 'ExpressionIndentifierOptional'}),
            this.getMatcherOptions({
              finalize: ({ token }) => {
                return token.children[0];
              }
            }, { stopOnFirstMatch: true })
          )
        );
      }
    };
  });

  return {
    $EXPRESSION
  };
};
