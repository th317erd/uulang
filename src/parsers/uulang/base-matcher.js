const Utils = require('../parser-utils');

function buildBaseMatcher(Adextopa) {
  const { Token, MatcherDefinition } = Adextopa;
  const _defineMatcher = Adextopa.defineMatcher;

  function defineMatcher(name, definer, parent) {
    return _defineMatcher(name, definer, parent || BaseMatcher);
  }

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
        finalize: Utils.finalize((args) => {
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

  return Object.assign({}, Adextopa, {
    defineMatcher,
    BaseMatcher
  });
}

module.exports = {
  buildBaseMatcher
};
