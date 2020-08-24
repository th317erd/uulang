const { setLastChild } = require("../parser-utils");

module.exports = (GT, { defineMatcher }) => {
  const $FUNCTION_DECLARATOR = defineMatcher('FunctionDeclarator', (ParentClass) => {
    return class FunctionDeclaratorMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $EQUALS,
          $OPTIONAL,
          $IDENTIFIER,
          $PROGRAM,
          $SCOPE
        } = GT;

        this.setMatcher(
          $PROGRAM(
            $OPTIONAL($IDENTIFIER()),
            $_WS(),
            $EQUALS('->{', 'FunctionScopeEntry'),
            $OPTIONAL($SCOPE({ typeName: 'FunctionBody' })),
            $EQUALS('}', 'FunctionScopeExit'),

            this.getMatcherOptions({
              debugSkip: true
            })
          )
        );
      }

      respond(context) {
        var result = super.respond(context);
        if (!this.isToken(result) || this.isSkipToken(result))
          return result;

        var token = result,
            scope = token.children.find((token) => (token.typeName === 'FunctionBody')) || null;

        token.defineProperties({
          name: (token.children[0].typeName === 'Identifier') ? token.children[0] : null,
          children: (scope) ? [ scope ] : [],
          body: scope
        });

        return token;
      }
    };
  });

  return {
    $FUNCTION_DECLARATOR
  };
};
