function finalize(callback) {
  return function(args) {
    var { token } = args;

    token.defineProperties({ syntaxType: 'UULang' });

    return (callback) ? callback.call(this, args) : token;
  };
}

module.exports = {
  finalize
};
