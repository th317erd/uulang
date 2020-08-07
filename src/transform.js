const Adextopa    = require('adextopa'),
      { UULANG }  = require('./parsers');

/* TODO:
 * Need to think about how this parser can be extended at runtime
 */

const { Parser }                = Adextopa;
const $UULANG                   = UULANG(Adextopa);
const DEFAULT_TRANSFORM_OPTIONS = {
};

function transform(_source, _opts, cb) {
  const tokenize = (resolve, reject) => {
    try {
      var parser  = new Parser(source, opts),
          token   = parser.tokenize($UULANG);

      return resolve(token);
    } catch (e) {
      return reject(e);
    }
  };

  var source = _source.toString(),
      opts = {
        ...DEFAULT_TRANSFORM_OPTIONS,
        ...(_opts || {})
      };

  if (arguments.length < 3)
    return new Promise(tokenize);

  if (typeof cb !== 'function')
    throw new TypeError('transform: Third argument must be a `function`');

  return tokenize(
    (value) => cb(null, value),
    (error) => cb(error, null)
  );
}

module.exports = {
  DEFAULT_TRANSFORM_OPTIONS,
  transform
};
