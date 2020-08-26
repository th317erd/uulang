require('colors');

const FileSystem                = require('fs');
const Path                      = require('path');
const { suite }                 = require('./test-utils');
const { Token }                 = require('adextopa'),
      { loadTestSource }        = require('./test-utils'),
      { Generators, transform } = require('./lib');

const { JavascriptGenerator }   = Generators;

function transformFile(_fileName, callback) {
  var fileName  = _fileName.replace(/\.uu$/, ''),
      source    = loadTestSource(fileName),
      generator = new JavascriptGenerator();

  transform(source, { fileName: `${fileName}.uu`, debug: false, debugLevel: 1 }, (err, token) => {
    callback(err, generator, token);
  });
}

suite('UULang', ({ describe, it, fdescribe, fit, expect }) => {
  describe("Transform", function() {
    var files = FileSystem.readdirSync(Path.join(__dirname, 'test-uu'));
    files.forEach((fileName) => {
      it(`should be able to transform ${fileName}`, function(done) {
        transformFile(fileName, (err, generator, token) => {
          if (err) {
            fail(err);
            return done();
          }

          expect(token instanceof Token).toBe(true);

          var generatedResult = generator.generate(token);
          expect(generatedResult).toMatchSnapshot(this);

          done();
        });
      });
    });
  });
});

