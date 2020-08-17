const Utils = require('./uulang-parser-utils');

module.exports = {
  UULANG: (Adextopa) => {
    const { GenericTokens } = Adextopa;
    const GT = Object.assign({}, GenericTokens);

    Object.assign(GT, require('./whitespace')(GT, Utils, Adextopa));
    Object.assign(GT, require('./end-of-statement')(GT, Utils, Adextopa));
    Object.assign(GT, require('./identifier')(GT, Utils, Adextopa));
    Object.assign(GT, require('./operator')(GT, Utils, Adextopa));
    Object.assign(GT, require('./numeric-literal')(GT, Utils, Adextopa));
    Object.assign(GT, require('./string-literal')(GT, Utils, Adextopa));
    Object.assign(GT, require('./literal')(GT, Utils, Adextopa));
    Object.assign(GT, require('./variable-declarator')(GT, Utils, Adextopa));

    const { $SCOPE } = Object.assign(GT, require('./scope')(GT, Utils, Adextopa));

    return Object.assign(GT, {
      $UULANG: $SCOPE()
    });
  }
};
