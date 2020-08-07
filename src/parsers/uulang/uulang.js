module.exports = {
  UULANG: (Adextopa) => {
    const { GenericTokens } = Adextopa;
    const {
      $PROGRAM
    } = GenericTokens;
    const GT = GenericTokens;

    const { $WS, $_WS }   = require('./whitespace')(GT, Adextopa),
          { $IDENTIFIER } = require('./identifier')(GT, Adextopa);

    return $PROGRAM(
      $_WS({ min: 0, max: 0 }),
      $IDENTIFIER(),
      $_WS({ min: 0, max: 0 })
    )
  }
};
