var FileSystem  = require('fs'),
    Path        = require('path'),
    mkdirp      = require('mkdirp'),
    jsDiff      = require('diff'),
    colors      = require('colors');

function loadTestSource(name) {
  var fullFileName = Path.resolve(__dirname, 'test-uu', `${name}.uu`);
  return FileSystem.readFileSync(fullFileName, 'utf8');
}

function getSnapShotInfo(testName) {
  const fsSafeName = (name) => {
    return name.replace(/\W+/g, '_');
  };

  var parts         = testName.replace(/\.uu$/, '').split('///').map(fsSafeName),
      path          = Path.join(__dirname, 'snapshots', ...parts.slice(0, -1)),
      fullFileName  = `${Path.join(path, parts[parts.length - 1])}.snapshot`,
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

const CUSTOM_MATCHERS = {
  toMatchSnapshot: function(util, customEqualityTesters) {
    return {
      compare: function(actualValue, expectedValue, testName) {
        try {
          var snapshot = getSnapShotInfo(testName);
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
      }
    };
  }
};

// wrap custom matcher call to supply extra testName argument
function injectCustomMatchers(testName, scope) {
  const wrapMatcher = (matcher) => {
    if (matcher._wrapper)
      return matcher;

    var func = function(...args) {
      return matcher.apply(this, args.concat(testName));
    };

    func._wrapper = true;

    return func;
  };

  var newScope            = Object.create(scope),
      customMatcherNames  = Object.keys(CUSTOM_MATCHERS);

  for (var i = 0, il = customMatcherNames.length; i < il; i++) {
    var name = customMatcherNames[i];
    newScope[name] = wrapMatcher(scope[name]);
  }

  return newScope;
};

// Wrap all jasmine test methods to capture the testName
function suite(name, callback) {
  function modifyScope(testName, parentScope) {
    // Always inject custom matchers
    if (!jasmineStart) {
      jasmineStart = true;
      beforeAll(function() {
        jasmine.addMatchers(CUSTOM_MATCHERS);
      });
    }

    var scope = Object.create(parentScope);
    scope.testName = testName;

    return scope;
  }

  const definerWrapHelper = (method) => {
    return function(unitName, callback) {
      var previousTestName  = currentTestName,
          thisTestName      = currentTestName = [ currentTestName, unitName ].join('///');

      const injectedCallback = (callback.length) ? function(done) {
        currentTestName = thisTestName;
        return callback.apply(modifyScope(thisTestName, this), arguments);
      } : function() {
        currentTestName = thisTestName;
        return callback.apply(modifyScope(thisTestName, this), arguments);
      };

      var result = method.call(this, name, injectedCallback);

      currentTestName = previousTestName;

      return result;
    };
  };

  var jasmineStart    = false,
      currentTestName = name;

  const functionalWrapHelper = (method) => {
    return function() {
      var ret = method.apply(this, arguments);
      return injectCustomMatchers(currentTestName, ret);
    };
  };

  callback({
    it: definerWrapHelper(it),
    fit: definerWrapHelper(fit),
    describe: definerWrapHelper(describe),
    fdescribe: definerWrapHelper(fdescribe),
    expect: functionalWrapHelper(expect)
  });
}

module.exports = {
  loadTestSource,
  suite
};
