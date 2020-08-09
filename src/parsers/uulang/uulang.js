module.exports = {
  UULANG: (Adextopa) => {
    const { GenericTokens } = Adextopa;
    const {
      $PROGRAM
    } = GenericTokens;
    const GT = GenericTokens;

    const { $WS, $_WS }   = require('./whitespace')(GT, Adextopa),
          { $IDENTIFIER } = require('./identifier')(GT, Adextopa),
          { $OPERATOR }   = require('./operator')(GT, Adextopa),
          { $STRING }     = require('./string')(GT, Adextopa);

    return {
      $UULANG: $PROGRAM(
        $_WS({ min: 0, max: 0 }),
        $IDENTIFIER(),
        $_WS({ min: 0, max: 0 }),
        $OPERATOR(),
        $_WS({ min: 0, max: 0 }),
        $STRING(),
        $_WS({ min: 0, max: 0 }),
        {
          typeName: 'Program',
          _finalize: ({ token }) => {
            token.defineProperties({ type: 'UULang' });
            return token;
          }
        }
      ),
      $WS, $_WS,
      $IDENTIFIER,
      $OPERATOR,
      $STRING
    };
  }
};
