module.exports = (GT, { defineMatcher }) => {
  const $EXPRESSION_STATEMENT = defineMatcher('ExpressionStatement', (ParentClass) => {
    return class ExpressionMatcher extends ParentClass {
      constructor(_opts) {
        var opts = _opts || {};

        super(opts);

        const {
          $IDENTIFIER,
          $LITERAL,
          $SELECT,
          $LOOP,
          $ASSIGNMENT_EXPRESSION,
          $MEMBER_EXPRESSION
        } = GT;

        this.setMatcher(
          $LOOP(
            $SELECT(
              $ASSIGNMENT_EXPRESSION(),
              $MEMBER_EXPRESSION(),
              $LITERAL(),
              $IDENTIFIER(),
              {
                debugSkip: true,
                optimize: ({ offset, source }) => {
                  var char = source.charAt(offset);

                  if (char === '=')
                    return 0;

                  if (char === '.')
                    return 1;

                  if (char === '-' && source.charAt(offset + 1) === '>')
                    return false;

                  if (char.match(/["\d-]/))
                    return 2;

                  if (char.match(/[_a-zA-Z]/))
                    return 3;

                  return false;
                }
              }
            ),
            this.getMatcherOptions({
              debugSkip: true,
              before: ({ context, token }) => {
                context.parentScope = token;
                return token;
              },
              finalize: ({ token }) => {
                if (token.children.length > 1)
                  return token;

                return token.children[0];
              }
            })
          )
        );
      }
    };
  });

  return {
    $EXPRESSION_STATEMENT
  };
};
