var FileSystem  = require('fs'),
    Path        = require('path'),
    mkdirp      = require('mkdirp'),
    jsDiff      = require('diff'),
    colors      = require('colors');

function loadTestSource(name) {
  var fullFileName = Path.resolve(__dirname, 'test-uu', `${name}.uu`);
  return FileSystem.readFileSync(fullFileName, 'utf8');
}

function getSnapShotInfo() {
  const fsSafeName = (name) => {
    return name.replace(/\W+/g, '_');
  };

  var error       = new Error(),
      stack       = error.stack.split(/\n/g).slice(1),
      stackFiles  = stack.map((item) => item.replace(/.*?\(?([^\s()]+)\)?$/, (m, fileName) => fileName)),
      specFile    = stackFiles.find((item) => (/\/spec\/.*-spec\.js(?::\d*:\d*$)?/).test(item)),
      spec        = (() => {
        var lineNumber,
            fileName;

        fileName = specFile.replace(/:(\d+):(\d+)$/, (m, line, column) => {
          lineNumber = parseInt(line, 10);
          return '';
        });

        return {
          lineNumber,
          fileName
        };
      })(),
      fileContents    = FileSystem.readFileSync(spec.fileName, 'utf8'),
      chunks          = fileContents.split(/\n/),
      relevantChunks  = chunks.slice(0, spec.lineNumber);

  var specName = ((fileName) => {
    var names = [],
        stop  = false;

    for (var i = relevantChunks.length - 1; i >= 0; i--) {
      var chunk = relevantChunks[i];
      chunk.replace(/^(\s*)(f?describe|f?it)\s*\(\s*(['"])([^\3]*?)\3/, (m, space, type, _, name) => {
        if (!space || !space.length)
          stop = true;

        names.push(fsSafeName(name));
      });

      if (stop)
        break;
    }

    return names.concat(fsSafeName(Path.basename(fileName, '.js'))).reverse().join('/') + '.snapshot';
  })(spec.fileName);

  var path          = Path.join(__dirname, 'snapshots', Path.dirname(specName)),
      fullFileName  = Path.join(path, Path.basename(specName)),
      snapshotValue;

  try {
    snapshotValue = FileSystem.readFileSync(fullFileName, 'utf8');
  } catch (e) {
    if (e.code !== 'ENOENT')
      throw e;
  }

  return {
    path,
    fileName: fullFileName,
    value: snapshotValue
  };
}

function showDiff(fileName, c1, c2) {
  var diff = jsDiff.diffChars(fileName, c1 || '', c2 || '');
  return diff.map((part) => {
    var color;

    if (part.added)
      color = 'green';
    else if (part.removed)
      color = 'red';

    return (color) ? part.value[color] : part.value;
  }).join('');
}

CUSTOM_MATCHERS = {
  toMatchSnapshot: function(util, customEqualityTesters) {
    return {
      compare: function(actualValue) {
        try {
          var snapshot = getSnapShotInfo();
          if (snapshot.value == null) {
            mkdirp.sync(snapshot.path);

            FileSystem.writeFileSync(snapshot.fileName, actualValue, 'utf8');

            return {
              pass: true
            };
          }

          if (snapshot.value !== actualValue) {
            return {
              pass: false,
              message: `${'Does not match snapshot:\n'.white}${showDiff(snapshot.value, actualValue)}`
            };
          }

          return {
            pass: true
          };
        } catch (e) {
          return {
            pass: false,
            message: `Can not figure out snapshot name: ${e.message}`
          };
        }

        return result;
      }
    };
  }
};


module.exports = {
  loadTestSource,
  CUSTOM_MATCHERS
};
