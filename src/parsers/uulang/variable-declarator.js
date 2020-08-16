module.exports = (GT, { finalize }) => {
  const {
    $_WS,
    $END_OF_STATEMENT,
    $OPTIONAL,
    $IDENTIFIER,
    $MATCHES,
    $LITERAL,
    $PROGRAM
  } = GT;

  function $VARIABLE_DECLARATOR(opts) {
    return $PROGRAM(
      $IDENTIFIER(),
      $_WS(),
      $MATCHES(/=/, { typeName: 'AssignmentOperator' }),
      $_WS(),
      $LITERAL(),
      $_WS(),
      $OPTIONAL($END_OF_STATEMENT()),
      {
        typeName: 'VariableDeclarator',
        _finalize: finalize(({ matcher, token }) => {
          var parts = token.children.filter((token) => (token.typeName !== 'AssignmentOperator' && token.typeName !== 'WhiteSpace'));
          if (parts.length !== 2)
            return matcher.fail();

          token.defineProperties({
            id: parts[0],
            init: parts[1],
            children: parts
          });

          return token;
        })
      }
    );
  };

  return {
    $VARIABLE_DECLARATOR
  };
};
