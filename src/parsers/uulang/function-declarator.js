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
            //$OPTIONAL($IDENTIFIER()),
            //$_WS(),
            $EQUALS('->{', { typeName: 'FunctionScopeEntry' }),
            $SCOPE({ typeName: 'FunctionBody' }),
            $EQUALS('}', { typeName: 'FunctionScopeExit' }),

            this.getMatcherOptions({
              debugSkip: true,
              finalize: ({ matcher, token, context }) => {
                var scope = token.children.find((token) => (token.typeName === 'FunctionBody'));
                token.defineProperties({ id: null, children: (scope) ? [ scope ] : [], body: scope });

                // if (token.children[0].typeName === 'Identifier') {
                //   token.defineProperties({ name: token.children[0] });

                //   return token;
                // }

                var lastToken = context.parentScope && context.parentScope.getLastChild();
                if (lastToken && lastToken.typeName === 'Identifier') {
                  token.defineProperties({ name: lastToken });

                  context.parentScope.setLastChild(token);

                  return matcher.skip(context, matcher.endOffset);
                }

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
