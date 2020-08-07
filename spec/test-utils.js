var FileSystem  = require('fs'),
    Path        = require('path');

function loadTestSource(name) {
  var fullFileName = Path.resolve(__dirname, 'test-uu', `${name}.uu`);
  return FileSystem.readFileSync(fullFileName, 'utf8');
}

module.exports = {
  loadTestSource
};
