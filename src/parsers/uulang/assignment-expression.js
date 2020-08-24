module.exports = (GT, { defineMatcher }) => {
  const $ASSIGNMENT_EXPRESSION = defineMatcher('AssignmentExpression', (ParentClass) => {
    return class FunctionBodyMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $EQUALS,
          $PROGRAM,
          $RIGHT_HAND_EXPRESSION
        } = GT;

        this.setMatcher(
          $PROGRAM(
            $EQUALS('=', 'AssignmentOperator'),
            $_WS(),
            $RIGHT_HAND_EXPRESSION(),
            this.getMatcherOptions({ debugSkip: true })
          )
        );
      }

      respond(context) {
        var result = super.respond(context);
        if (!this.isToken(result) || this.isSkipToken(result))
          return result;

        var token     = result,
            lastToken = context.parentScope && context.parentScope.getLastChild();

        if (lastToken && ([ 'Identifier', 'MemberExpression', 'FunctionDeclarator', 'AssignmentExpression' ].indexOf(lastToken.typeName) >= 0)) {
          context.parentScope.setLastChild(
            this.createToken(token.getSourceRange(), {
              typeName: this.getTypeName(),
              left: lastToken,
              operator: token.children[0].value,
              right: token.children[1]
            })
          );

          return this.skip(context, this.endOffset);
        } else {
          return this.error(context, "Syntax Error: Invalid assignment", this.startOffset + 1);
        }
      }
    };
  });

  return {
    $ASSIGNMENT_EXPRESSION
  };
};
