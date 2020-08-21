module.exports = (GT, { finalize, defineMatcher }) => {
  const {
    $PROGRAM,
    $OPTIONAL,
    $STRING_LITERAL,
    $NUMERIC_LITERAL
  } = GT;

  const $LITERAL = defineMatcher('$LITERAL', (ParentClass) => {
    return class LiteralMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: (
            $PROGRAM(
              $OPTIONAL($STRING_LITERAL(), { typeName: 'LiteralStringOptional'}),
              $OPTIONAL($NUMERIC_LITERAL(), { typeName: 'LiteralNumericOptional'}),
              Object.assign({
                typeName: 'Literal',
                _finalize: finalize(({ token }) => token.children[0])
              }, opts || {})
            )
          )
        });
      }

      respond(context) {
        return this._matcher.exec(this.getParser(), this.getSourceRange(), context);
      }
    };
  });

  return {
    $LITERAL
  };
};
