module.exports = (GT, { defineMatcher }) => {
  const $VARIABLE_DECLARATOR = defineMatcher('VariableDeclarator', (ParentClass) => {
    return class VariableDeclaratorMatcher extends ParentClass {
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
            $EQUALS(':', 'AssignmentOperator'),
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

        var token = result;

        var lastToken = context.parentScope && context.parentScope.getLastChild();
        if (lastToken && lastToken.typeName === 'Identifier') {
          token.defineProperties({
            id: lastToken,
            init: token.children[1]
          });

          context.parentScope.setLastChild(token);

          return this.skip(context, this.endOffset);
        } else {
          return this.error(context, "Syntax Error: Unexpected token ':'", this.startOffset + 1);
        }
      }
    };
  });

  return {
    $VARIABLE_DECLARATOR
  };
};
