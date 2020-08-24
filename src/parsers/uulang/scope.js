module.exports = (GT, { defineMatcher }) => {
  const $SCOPE = defineMatcher('Scope', (ParentClass) => {
    return class ScopeMatcher extends ParentClass {
      constructor(opts) {
        super(opts);

        const {
          $_WS,
          $SELECT,
          $LOOP,
          $END_OF_STATEMENT,
          $EXPRESSION_STATEMENT,
          $DECLARATOR_STATEMENT
        } = GT;

        this.setMatcher(
          $LOOP(
            $SELECT(
              $_WS(),
              $END_OF_STATEMENT(),
              $DECLARATOR_STATEMENT(),
              $EXPRESSION_STATEMENT(),
              {
                debugSkip: true,
                optimize: ({ offset, source, index }) => {
                  var char = source.charAt(offset);

                  if (char === ';')
                    return 1;

                  if (char.match(/\s+/))
                    return 0;

                  return (index < 2) ? 2 : undefined;
                }
              }
            ),
            this.getMatcherOptions({
              debugSkip: true,
              before: ({ context, token }) => {
                context.parentScope = token;
                return token;
              }
            })
          )
        );
      }
    };
  });

  return {
    $SCOPE
  };
};
