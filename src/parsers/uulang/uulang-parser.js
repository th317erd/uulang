const { buildBaseMatcher } = require('./base-matcher');
const _Utils = require('../parser-utils');

module.exports = {
  UULANG: (Adextopa) => {
    const {
      defineMatcher,
      GenericTokens
    }                 = buildBaseMatcher(Adextopa);
    const GT          = Object.assign({}, GenericTokens);
    const Utils       = Object.assign(
      {},
      _Utils,
      { defineMatcher }
    );

    Object.assign(GT, require('./whitespace')(GT, Utils, Adextopa));
    Object.assign(GT, require('./end-of-statement')(GT, Utils, Adextopa));
    Object.assign(GT, require('./identifier')(GT, Utils, Adextopa));
    Object.assign(GT, require('./operator')(GT, Utils, Adextopa));
    Object.assign(GT, require('./numeric-literal')(GT, Utils, Adextopa));
    Object.assign(GT, require('./string-literal')(GT, Utils, Adextopa));
    Object.assign(GT, require('./literal')(GT, Utils, Adextopa));
    Object.assign(GT, require('./member-expression')(GT, Utils, Adextopa));
    Object.assign(GT, require('./assignment-expression')(GT, Utils, Adextopa));
    Object.assign(GT, require('./expression-statement')(GT, Utils, Adextopa));
    Object.assign(GT, require('./variable-declarator')(GT, Utils, Adextopa));
    Object.assign(GT, require('./function-declarator')(GT, Utils, Adextopa));
    Object.assign(GT, require('./right-hand-expression')(GT, Utils, Adextopa));
    Object.assign(GT, require('./declarator-statement')(GT, Utils, Adextopa));
    Object.assign(GT, require('./scope')(GT, Utils, Adextopa));

    return {
      $UULANG: defineMatcher('Program', (ParentClass) => {
        return class StringLiteralMatcher extends ParentClass {
          constructor(opts) {
            super(opts);

            this.setMatcher(
              GT['$SCOPE'](this.getMatcherOptions())
            );
          }
        };
      })
    };
  }
};
