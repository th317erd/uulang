module.exports = (GT, { finalize, defineMatcher }) => {
  const {
    $DISCARD,
    $EQUALS
  } = GT;

  const $END_OF_STATEMENT = defineMatcher('$END_OF_STATEMENT', (ParentClass) => {
    return class EndOfStatementMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: $DISCARD($EQUALS(';', { typeName: 'EndOfStatementMatcher'}), { typeName: 'EndOfStatementDiscarder'})
        });
      }

      respond(context) {
        return this._matcher.exec(this.getParser(), this.getSourceRange(), context);
      }
    };
  });

  return {
    $END_OF_STATEMENT
  };
};
