require('colors');

const { CUSTOM_MATCHERS }       = require('./test-utils');

const { Token }                 = require('adextopa'),
      { loadTestSource }        = require('./test-utils'),
      { Generators, transform } = require('./lib');

const { JavascriptGenerator }   = Generators;

function transformFile(fileName, callback) {
  var source    = loadTestSource(fileName),
      generator = new JavascriptGenerator();

  transform(source, { fileName: `${fileName}.uu`, debug: false, debugLevel: 1 }, (err, token) => {
    callback(err, generator, token);
  });
}

describe("Transform", function() {
  beforeAll(function() {
    jasmine.addMatchers(CUSTOM_MATCHERS);
  });

  it("should be able to transform variable-declaration", function(done) {
    transformFile('variable-declaration', (err, generator, token) => {
      if (err) {
        fail(err);
        return done();
      }

      expect(token instanceof Token).toBe(true);
      var generatedResult = generator.generate(token);
      expect(generatedResult).toMatchSnapshot();

      done();
    });
  });

  it("should be able to transform function-declaration", function(done) {
    transformFile('function-declaration', (err, generator, token) => {
      if (err) {
        fail(err);
        return done();
      }

      expect(token instanceof Token).toBe(true);

      var generatedResult = generator.generate(token);
      expect(generatedResult).toMatchSnapshot();

      done();
    });
  });

  it("should be able to transform assignment-expression", function(done) {
    transformFile('assignment-expression', (err, generator, token) => {
      if (err) {
        fail(err);
        return done();
      }

      expect(token instanceof Token).toBe(true);

      var generatedResult = generator.generate(token);
      debugger;
      expect(generatedResult).toMatchSnapshot();

      done();
    });
  });

  it("should be able to transform member-expression", function(done) {
    transformFile('member-expression', (err, generator, token) => {
      if (err) {
        fail(err);
        return done();
      }

      expect(token instanceof Token).toBe(true);
      debugger;
      var generatedResult = generator.generate(token);
      expect(generatedResult).toMatchSnapshot();

      done();
    });
  });
});
