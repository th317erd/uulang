module.exports = (GT, { defineMatcher }) => {
  const $EXPRESSION = defineMatcher('ExpressionStatement', (ParentClass) => {
    return class ExpressionMatcher extends ParentClass {
      constructor(_opts) {
        var opts = _opts || {};

        super(opts);

        const {
          $ASSIGNMENT_EXPRESSION,
          $FUNCTION_DECLARATOR,
          $IDENTIFIER,
          $MEMBER_EXPRESSION,
          $OPTIONAL,
          $SELECT,
          $VARIABLE_DECLARATOR
        } = GT;

        this.setMatcher(
          $SELECT(
            $OPTIONAL($ASSIGNMENT_EXPRESSION(), { typeName: 'ExpressionAssignmentExpressionOptional'}),
            $OPTIONAL($VARIABLE_DECLARATOR(), { typeName: 'ExpressionVariableDeclaratorOptional'}),
            $OPTIONAL($FUNCTION_DECLARATOR(), { typeName: 'ExpressionFunctionBodyOptional'}),
            $OPTIONAL($MEMBER_EXPRESSION(), { typeName: 'ExpressionMemberExpressionOptional'}),
            $OPTIONAL($IDENTIFIER(), { typeName: 'ExpressionIndentifierOptional'}),
            this.getMatcherOptions()
          )
        );
      }
    };
  });

  return {
    $EXPRESSION
  };
};
