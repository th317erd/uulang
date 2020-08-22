module.exports = (GT, { defineMatcher }) => {
  const $FUNCTION_DECLARATOR = defineMatcher('FunctionDeclarator', (ParentClass) => {
    return class FunctionDeclaratorMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $END_OF_STATEMENT,
          $OPTIONAL,
          $EQUALS,
          $IDENTIFIER,
          $PROGRAM,
          $SCOPE
        } = GT;

        this.setMatcher(
          $PROGRAM(
            $OPTIONAL($IDENTIFIER()),
            $_WS(),
            $EQUALS('->{', { typeName: 'FunctionScopeEntry' }),
            $SCOPE({ typeName: 'FunctionBody' }),
            $_WS(),
            $EQUALS('}', { typeName: 'FunctionScopeExit' }),
            $END_OF_STATEMENT(),
            this.getMatcherOptions({
              finalize: ({ token }) => {
                var scope = token.children.find((token) => (token.typeName === 'FunctionBody'));

                if (token.children[0].typeName === 'Identifier')
                  token.defineProperties({ id: token.children[0] });

                token.defineProperties({ children: [ scope ] });

                return token;
              }
            })
          )
        );
      }
    };
  });

  return {
    $FUNCTION_DECLARATOR
  };
};
