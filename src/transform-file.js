const FileSystem    = require('fs'),
      { transform } = require('./transform');

function transformFile(fileName, _opts, callback) {
  var opts = Object.assign({ fileName }, _opts || {});

  if (arguments.length < 3) {
    return new Promise((resolve, reject) => {
      FileSystem.readFile(fileName, 'utf8', function(err, data) {
        if (err)
          return reject(err);

        transform(data, opts, (err, token) => {
          if (err)
            return reject(err);

          resolve(token);
        });
      });
    });
  }

  if (typeof callback !== 'function')
    throw new TypeError('transform: Third argument must be a `function`');

  return FileSystem.readFile(fileName, 'utf8', function(err, data) {
    if (err)
      return callback(err, null);

    transform(data, opts, callback);
  });
}

module.exports = {
  transformFile
};
