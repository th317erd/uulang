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

    getMatcherOptions(opts) {
      return Object.assign({ typeName: this.getTypeName() }, this.getOptions(), opts || {});
    }

    respond(context) {
      var result = this._matcher.exec(this.getParser(), this.getSourceRange(), context);
      if (!this.isToken(result))
        return result;

      this.endOffset = result.getSourceRange().end;

      return result;
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
