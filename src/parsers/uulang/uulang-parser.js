const _Utils = require('../parser-utils');

module.exports = {
  UULANG: (Adextopa) => {
    const { Token, GenericTokens, MatcherDefinition } = Adextopa;

    const _defineMatcher  = Adextopa.defineMatcher;
    const GT              = Object.assign({}, GenericTokens);

    const BaseMatcher = class BaseMatcher extends MatcherDefinition {
      setMatcher(matcher) {
        Object.defineProperty(this, '_matcher', {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: matcher
        });
      }

      getMatcherOptions(_opts, extraOpts) {
        var opts          = _opts || {},
            superOptions  = this.getOptions(),
            finalize      = opts.finalize;

        return Object.assign({ typeName: this.getTypeName() }, opts, superOptions, {
          finalize: _Utils.finalize((args) => {
            var result = args.token;

            if (typeof finalize === 'function')
              result = finalize.call(this, args);

            if (!(result instanceof Token))
              return result;

            if (typeof superOptions.finalize === 'function')
              result = superOptions.finalize.call(this, Object.assign({}, args, { token: result }));

            return result;
          })
        }, extraOpts);
      }

      respond(context) {
        return this._matcher.exec(this.getParser(), this.getSourceRange(), context);
      }
    };

    function defineMatcher(name, definer, parent) {
      return _defineMatcher(name, definer, parent || BaseMatcher);
    }

    const Utils = Object.assign(
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
    Object.assign(GT, require('./variable-declarator')(GT, Utils, Adextopa));
    Object.assign(GT, require('./expression-statement')(GT, Utils, Adextopa));
    Object.assign(GT, require('./function-declarator')(GT, Utils, Adextopa));
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
