require('colors');

const Adextopa    = require('adextopa'),
      { UULANG }  = require('./parsers');

/* TODO:
 * Need to think about how this parser can be extended at runtime
 */

const { Parser }                = Adextopa;
const { $UULANG }               = UULANG(Adextopa);
const DEFAULT_TRANSFORM_OPTIONS = {
};

function transform(_source, _opts, cb) {
  const tokenize = (resolve, reject) => {
    const formatErrorOrWarningMessage = (result, colors) => {
      const applyColor = (_str) => {
        var str = _str;

        for (var i = 1, il = colors.length; i < il; i++) {
          var color = colors[i];
          str = str[color];
        }

        return str;
      };

      var sourceStr     = parser.getSourceAsString(),
          sourceRange   = result.sourceRange,
          info          = parser.getLinesAndColumnsFromRange(sourceStr, sourceRange),
          issueStr      = applyColor(sourceStr.substring(sourceRange.start, sourceRange.end)),
          fileInfoStr   = `${parser.getOptions().fileName}[${info.startLine}:${info.startColumn}]`,
          errorMessage  = `${fileInfoStr}: ${result.message}:`[colors[0]];

      return `${errorMessage} ${sourceStr.substring(sourceRange.start - 10, sourceRange.start)}${issueStr}${sourceStr.substring(sourceRange.end, sourceRange.end + 10)}`;
    };

    const prettyPrintWarning = (warning) => {
      console.log(formatErrorOrWarningMessage(warning, [ 'yellow', 'white', 'bgYellow' ]));
    };

    const prettyPrintError = (error) => {
      console.log(formatErrorOrWarningMessage(error, [ 'red', 'white', 'bgRed' ]));
    };

    try {
      var parser  = new Parser(source, opts),
          token   = parser.tokenize($UULANG);

      return resolve(token);
    } catch (e) {
      var errors = parser.getErrors();

      errors.forEach(prettyPrintError);

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
